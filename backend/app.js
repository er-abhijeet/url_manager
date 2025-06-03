import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';
import cors from "cors";

const client_url = "http://192.168.31.232:3003/";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('trust proxy', true);

const { Pool } = pg;

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect()
    .then(() => console.log("Connected to Neon DB"))
    .catch(err => console.error("Neon DB connection error", err.stack));

// app.use((req, res, next) => {
//   const ip = req.ip;
//   const userAgent = req.headers['user-agent'] || '';

//   let deviceType = 'Unknown';
//   if (/mobile/i.test(userAgent)) {
//     deviceType = 'Mobile';
//   } else if (/tablet|ipad/i.test(userAgent)) {
//     deviceType = 'Tablet';
//   } else {
//     deviceType = 'Desktop';
//   }

//   let osType = 'Unknown';
//   if (/windows nt/i.test(userAgent)) {
//     osType = 'Windows';
//   } else if (/android/i.test(userAgent)) {
//     osType = 'Android';
//   } else if (/mac os x/i.test(userAgent)) {
//     osType = 'macOS';
//   } else if (/linux/i.test(userAgent)) {
//     osType = 'Linux';
//   } else if (/iphone|ipad|ipod/i.test(userAgent)) {
//     osType = 'iOS';
//   }

//   console.log("--Incoming Request--");
//   console.log('IP Address:', ip);
//   console.log('Device Type:', deviceType);
//   console.log('OS Type:', osType);
//   next();
// });

app.get('/', (req, res) => {
  console.log('Client IP:', req.ip);
  console.log('IP chain:', req.ips);
  const id = nanoid(4);
  console.log(id);
  res.json({ ip: req.ip, ips: req.ips });
});

app.get("/test", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM url_map");
        res.json(result.rows);
    } catch (err) {
        console.error("Error executing query", err.stack);
        res.status(500).json({ error: "Internal server error" });
    }
});

async function generateUniqueShortUrl(full_url) {
  const maxRetries = 5;
  for (let i = 0; i < maxRetries; i++) {
    if (i) console.log(`retries hit: ${i}`);
    const id = nanoid(8);
    try {
      const result = await db.query(
        'INSERT INTO url_map (short_url, full_url) VALUES ($1, $2) RETURNING *',
        [id, full_url]
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        continue;
      }
      throw err;
    }
  }
  throw new Error('Failed to generate unique short URL after several attempts.');
}

app.post('/create', async (req, res) => {
  const { full_url } = req.body;

  if (!full_url) {
    return res.status(400).json({ error: 'full_url is required' });
  }

  try {
    const newEntry = await generateUniqueShortUrl(full_url);
    res.status(201).json({
      short_url: client_url + newEntry.short_url,
      full_url: newEntry.full_url
    });
  } catch (err) {
    console.error('Error creating short URL:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




app.get('/urls', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.short_url,
        u.full_url,
        NULL AS created_at,
        COUNT(v.id) AS visits
      FROM url_map u
      LEFT JOIN url_visits v ON u.short_url = v.short_url
      GROUP BY u.id, u.short_url, u.full_url
      ORDER BY u.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching URLs');
  }
});

app.get('/analytics/:short_url/visits-by-date', async (req, res) => {
  try {
    const { short_url } = req.params;
    const result = await db.query(`
      SELECT 
        DATE(visited_at) AS date,
        COUNT(*) AS visits
      FROM url_visits
      WHERE short_url = $1
      GROUP BY date
      ORDER BY date ASC
    `, [short_url]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching visit data');
  }
});

app.get('/analytics/:short_url/devices', async (req, res) => {
  const { short_url } = req.params;
  const result = await db.query(`
    SELECT device_type AS name, COUNT(*) AS value
    FROM url_visits
    WHERE short_url = $1
    GROUP BY device_type
  `, [short_url]);
  res.json(result.rows);
});

app.get('/analytics/:short_url/oses', async (req, res) => {
  const { short_url } = req.params;
  const result = await db.query(`
    SELECT os_type AS name, COUNT(*) AS visits
    FROM url_visits
    WHERE short_url = $1
    GROUP BY os_type
  `, [short_url]);
  res.json(result.rows);
});

app.get('/analytics/:short_url/visits', async (req, res) => {
  const { short_url } = req.params;
  const result = await db.query(`
    SELECT 
      id,
      ip_address AS ip,
      device_type AS device,
      os_type AS os,
      is_proxy_or_vpn AS vpn,
      TO_CHAR(visited_at, 'YYYY-MM-DD HH24:MI') AS timestamp
    FROM url_visits
    WHERE short_url = $1
    ORDER BY visited_at DESC
  `, [short_url]);
  res.json(result.rows);
});

app.get('/:short_url', async (req, res) => {
  const { short_url } = req.params;

  try {
    const result = await db.query(
      'SELECT full_url FROM url_map WHERE short_url = $1',
      [short_url]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Short URL not found');
    }
    const full_url = result.rows[0].full_url;
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);

    const deviceType = parser.getDevice().type || 'Desktop';
    const osType = parser.getOS().name || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';

    const forwardedFor = req.headers['x-forwarded-for'];
    const isProxyOrVPN = !!forwardedFor && forwardedFor !== ip;

    await db.query(
      `INSERT INTO url_visits 
        (short_url, full_url, ip_address, device_type, os_type, is_proxy_or_vpn)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [short_url, full_url, ip, deviceType, osType, isProxyOrVPN]
    );

    res.redirect(full_url);
  } catch (err) {
    console.error('Redirect/logging error:', err);
    res.status(500).send('Internal server error');
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`App running in port ${PORT}`);
});
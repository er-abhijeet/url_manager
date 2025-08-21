import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://dev-rxrx468576ec84ic.us.auth0.com/.well-known/jwks.json`
  }),
  audience: "https://dev-rxrx468576ec84ic.us.auth0.com/api/v2/", // 👈 must match audience you set
  issuer: `https://dev-rxrx468576ec84ic.us.auth0.com/`,
  algorithms: ["RS256"]
});

export default checkJwt;
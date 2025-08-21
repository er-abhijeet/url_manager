import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LandingPage = () => {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-blue-600">URL Manager</span>
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Sign in to explore personalized features, your dashboard, and more.
        </p>

        {!isAuthenticated ? (
          <button
            onClick={() => loginWithRedirect()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </button>
        ) : (
          <div className="text-gray-700">
            <p className="mb-2">Welcome back, <strong>{user.name}</strong>!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

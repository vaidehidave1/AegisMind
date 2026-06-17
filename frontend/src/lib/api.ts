/**
 * Central API configuration.
 * In production (Vercel), set VITE_API_URL to your Render backend URL.
 * Falls back to localhost:8000 for local development.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

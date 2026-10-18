# Roblox Account Scanner

Combined static frontend and Vercel serverless API.

## Files
- `index.html`, `style.css`, `script.js`: frontend
- `api/roblox.js`: resolves username, public profile, avatar thumbnail, and available presence
- `api/health.js`: health check
- `package.json`: axios dependency
- `vercel.json`: serverless function config

## Deploy
1. Upload all files/folders to the root of a GitHub repository.
2. Import the repository at https://vercel.com/new.
3. Framework preset: Other. Vercel will install Axios from `package.json`; no build command is required.
4. Deploy and test `/api/health`, then enter a username on the home page.

The frontend expects `/api/roblox` to be hosted on the same domain. Do not deploy only the HTML files; the `api` folder and `package.json` are required.

## Scope
This tool fetches public Roblox profile information and avatar thumbnail only. It does not request passwords/cookies or access/modify accounts. Presence may be unavailable or approximate.


## Update v3
- Avatar endpoint now requests a full avatar thumbnail at 720x720.
- Run scan animates for 8 seconds with a longer console sequence and fetches the public profile.
- Security shortcuts open official Roblox login/security/recovery pages. The site never collects or changes passwords or email automatically.


## Configuration panel update
- The Configuration panel mirrors the public Roblox username, display name, user ID, and public avatar after a profile lookup.
- Email management and password changes open Roblox's official account pages; this app does not request or store credentials.
- Activity console labels reflect the public profile lookup worker and do not claim private account access.

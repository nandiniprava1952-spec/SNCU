# SNCU Tickler Dashboard (PWA)

Mobile-friendly, installable, offline-capable dashboard for NHM Odisha SNCU/NBSU newborn follow-up.
Data lives in your Google Sheet (via Apps Script); this repo contains only the web app.

## Publish on GitHub Pages
1. Create a new repository on github.com (e.g. `sncu-tickler`) and upload every file in this folder
   (keep the `icons` folder, `.nojekyll` and `.github` folder).
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions** (or "Deploy from a branch" → `main` / root).
3. Wait ~1 minute. Your app is at `https://<your-username>.github.io/<repo-name>/`.

## Install on a phone
- **Android / Chrome:** open the link → tap **⬇ Install app** (or ⋮ → Install app).
- **iPhone / Safari:** open the link → Share → **Add to Home Screen**.

## Updating
Replace `index.html` in the repo and commit. Phones pick up the new version on the next online open
(bump `V='sncu-v1'` in `sw.js` if an old copy ever sticks).

## Security notes
- Never commit `Code.gs` (it holds the district passcodes). It is in `.gitignore`.
- The offline password hashes were removed from this build; sign-in is checked by your Apps Script.
- GitHub Pages sites are public. Anyone can open the page, but nobody sees data without a valid login.

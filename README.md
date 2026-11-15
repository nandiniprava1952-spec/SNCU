# SNCU Tickler Dashboard (PWA)

Upload all 8 files to the repository root (no folders needed), then:
Settings -> Pages -> Source: "Deploy from a branch" -> Branch: main, folder: / (root) -> Save.
App URL: https://<username>.github.io/<repo-name>/

Install: Android/Chrome -> "Install app"; iPhone/Safari -> Share -> Add to Home Screen.
Do not upload Code.gs (it contains passcodes).

Cover / login page: top-right **Online** (green dot) / **Offline** (yellow dot) pill, and an **Install app** button at the bottom of the sign-in card (hidden once installed; iPhone/Safari shows "Tap Share, then Add to Home Screen").

## In-app update flow
1. **Update found** – the app checks when it opens, when you return to it, when the phone comes back online, and every 30 minutes. A card appears at the top with a progress ring and percentage: *Downloading update…*.
2. **Update ready** – at 100% it becomes *Update available* with **Update** and **Later**. Later hides the card until the next check (the downloaded copy is kept).
3. **Installing** – **Update** shows a spinning ring, *Installing update…*, then the app restarts on its own.
4. **After the restart** – *✔ Updated to the latest version* appears briefly.

`sw.js` is cache-first (cache `sncu-v8`): a new `index.html` is not picked up silently. The page compares the `ETag` of `index.html` on the host with its cached copy, downloads the new file into a staging cache, and swaps it in only when **Update** is tapped. To release: replace `index.html` and commit (no version bump needed). Records loaded from a file are held in memory, so after an update load the file again (cloud users just sign in / Sync now).

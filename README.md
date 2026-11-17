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

`sw.js` is cache-first (cache `sncu-v16`): a new `index.html` is not picked up silently. The page compares the `ETag` of `index.html` on the host with its cached copy, downloads the new file into a staging cache, and swaps it in only when **Update** is tapped. To release: replace `index.html` and commit (no version bump needed). Records loaded from a file are held in memory, so after an update load the file again (cloud users just sign in / Sync now).

## kobo pull (admin)

The State (admin) login shows a **⟳ kobo pull** button next to **Sync now**. It asks the Apps Script (`kobosync`) to fetch new Kobo submissions into the cloud sheet, then reloads the data. Needs `KOBO_TOKEN` in Apps Script properties and a deployed new version of `Code.gs`.

## Block logins

Login screen → **Login as: Block** → choose District, Block, enter the block passcode.

* The block passcode unlocks (AES-GCM, PBKDF2) that district's cloud password stored encrypted inside `index.html`; the app then signs in to the cloud as the district and shows **only that block's records**. No plain passcodes are stored in the file.
* "Other & Urban Facilities" shows records of the district whose block is not one of its listed blocks.
* Block names are matched phonetically (Anugul/Angul, Talacher/Talcher …). If a block shows no records, check how its name is spelt in the Kobo data.
* To change a passcode: regenerate the encrypted `BLOCKS` table (district password + new block passcode) and republish.
* Limitation: the block restriction is applied in the app. The cloud session itself is a district session, so it is not enforced by the server.

# Under the Stars

*A Little Universe Made for Miya* — a personal, cinematic anniversary website from Abdulhakim.

Seven scenes: a moonlit envelope, music, a photo reveal, "Abdulhakim & Miya" joined by a constellation, a handwritten letter, an original lyrical dedication, and a final starry ending with a glowing heart.

---

## What is in this folder

```
under-the-stars/
├── index.html        page structure
├── styles.css        all visuals and animation
├── script.js         scenes, music, starfield (no need to edit)
├── config.js         names, words, music and photo paths (edit this)
├── assets/           compressed photos
├── robots.txt        asks search engines not to index the page
├── .nojekyll         helper file for GitHub Pages
└── single-file-version/index.html   everything in ONE file (easiest to upload from a phone)
```

No build step, no backend, no installs. It is plain HTML, CSS and JavaScript.

## Customising (config.js)

Open `config.js` in any text editor. Names, every message, the letter, the dedication, the song and the photo paths are all there.
Use `{her}` and `{me}` inside any text and they become the names automatically.

- **Letter:** it is written to be sincere and general, because only you know your real memories. Add one or two true, specific details (a place, a joke, something she said). That is what will make her cry happy tears.
- **Photos:** replace files in `assets/` keeping the same names, or change the paths in `config.js`. Portrait photos around 4:5 work best. A spare photo of you is included as `assets/abdulhakim-photo-2.jpg`; swap it in under `photos.duoMe` if you prefer it.
- **Song:** change `youtubeId` and `watchUrl` in `config.js`.

## How the music works

- The song plays through **YouTube's official embedded player**. Nothing is downloaded, copied or re-hosted.
- It starts only after Miya taps **Open Your Surprise**, as browsers require.
- A control bar (play/pause, volume) stays visible at the top for the whole experience.
- The stars pulse gently while music plays. This is a steady rhythm set to the song's tempo (`bpm` in `config.js`). It is **not** a live analysis of the audio, because YouTube does not allow that.
- The video ID `2Vv-BfVoq4g` is the one listed for "Ed Sheeran – Perfect (Official Music Video)" across several sources. I could not open the official channel page from my environment, so **please tap play once on your own phone before sending the link** to confirm it plays.
- If the player cannot load (offline, blocked, or the video disallows embedding), a **Listen on YouTube** button appears instead. Nothing breaks.
- The dedication scene is original writing and says so on screen. It does not reproduce or imitate the song's lyrics.

## Test it

**On a computer:** run a tiny local server in this folder, for example `npx serve` (needs Node) or the VS Code "Live Server" extension, then open the address it shows.
Opening `index.html` by double-clicking works for everything except the YouTube player, which often refuses to load from a `file://` address. The fallback button will appear. This is normal and goes away once the site is hosted.

**On a phone (no computer):** just deploy it with one of the options below and test the real link.

### Phone checklist

- [ ] Opening scene shows moon, stars, envelope; text appears; button appears after a few seconds
- [ ] Tapping **Open Your Surprise** opens the envelope and music starts (volume up, silent switch off on iPhone)
- [ ] Play/pause and volume work in the top bar
- [ ] Photo scene: all three photos appear; swipe and arrow buttons work; thumbnails work
- [ ] "Abdulhakim & Miya" scene: both photos show, constellation draws
- [ ] **Read My Words** unfolds the letter; it scrolls; Continue appears at the end
- [ ] Dedication advances by itself or by tapping; arrows work
- [ ] Finale: lines appear, heart forms, **Replay** returns to the opening
- [ ] Rotate the phone and check nothing is cut off
- [ ] Try once on mobile data, then once on Wi-Fi

## Put it online (free)

**Please read first — privacy:** anyone who has the link can see the photos and the letter. Choose a hard-to-guess address, send the link only to Miya, and delete the site afterwards if you want it gone. On GitHub's free plan, Pages needs a **public repository**, so the files themselves are visible to anyone who finds the repository. Netlify does not have that problem.

### Option A: GitHub Pages, from a phone or computer (single file)

1. Sign in at github.com and create a **new public repository** with an unrelated, hard-to-guess name.
2. Choose **Add file → Upload files** and upload `single-file-version/index.html` (the file must be called `index.html`).
3. Tap **Commit changes**.
4. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
5. After one to two minutes the page shows your link: `https://YOUR-NAME.github.io/REPOSITORY-NAME/`.

### Option B: Netlify (best from a computer)

1. Make a free account at netlify.com.
2. Open **app.netlify.com/drop** and drag the whole `under-the-stars` folder onto the page.
3. Netlify gives you a link. In **Site configuration → Change site name**, make it something unguessable.

### Option C: GitHub Pages with the full folder (computer)

Same as Option A, but upload the contents of `under-the-stars` (including the `assets` folder) instead of the single file.

> Nothing has been published by me. The site is only live once you finish one of the options above and open your own link.

## Editing the single-file version

`single-file-version/index.html` is the same site packed into one file. The words and settings sit near the top inside the `CONFIG` block, so you can edit text in GitHub's built-in editor. The photos are further down as long blocks of letters and numbers; leave those alone.

## Known limits

- The pulse of the stars follows a fixed tempo, not the live audio.
- Fonts (Cormorant Garamond, Caveat, Jost) load from Google Fonts. If they cannot load, the page falls back to your device's fonts and still works.
- Some phones in low-power mode may pause the music; the play button in the top bar resumes it.
- Tested in headless Chrome at phone and desktop sizes. Please do a final check on your own phone before sending.

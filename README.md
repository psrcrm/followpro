# 📋 FollowPro — Smart Follow-up Manager

A **Progressive Web App (PWA)** for sales professionals to schedule and track customer follow-ups — installable on Android & iOS, works offline, no app store needed.

---

## ✨ Features

- 📋 **Schedule View** — Filter by Today / Overdue / Upcoming / Done
- 📅 **Smart Calendar** — Grid view with highlighted follow-up dates
- 📞 **One-tap Call & WhatsApp** — Pre-filled WhatsApp message
- ⚡ **Priority Levels** — Low / Medium / High color-coded
- 🔄 **Done + Reschedule** — Complete a call and instantly rebook
- 💾 **Offline Storage** — All data saved locally on device (localStorage)
- 📥 **Data Export** — Download your follow-ups as JSON backup
- ⚙️ **Custom Categories** — Add your own "Interested In" options (Plot, Villa, Insurance, etc.)
- 🗑️ **Delete with confirmation** — Safe delete flow
- 🔍 **Search** — Find by name, phone, or location

---

## 🚀 Deploy to GitHub Pages (Free Hosting)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "FollowPro PWA v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/followpro.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings → Pages**
3. Under **Source**, select `main` branch → `/ (root)` folder
4. Click **Save**
5. Your app will be live at:  
   `https://YOUR_USERNAME.github.io/followpro/`

---

## 📱 Install on Mobile (PWA)

### Android (Chrome)
1. Open `https://YOUR_USERNAME.github.io/followpro/` in Chrome
2. Tap the **⋮ menu → "Add to Home Screen"**
3. Tap **Install** → App appears on your home screen

### iPhone (Safari)
1. Open the URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share icon (□↑)**
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **Add** → App icon appears on your home screen

> 💡 Once installed, it works like a native app — full screen, no browser bar, offline capable.

---

## 📁 File Structure

```
followpro/
├── index.html          ← Main app (React + all code, no build needed)
├── manifest.json       ← PWA manifest (name, icons, theme)
├── sw.js               ← Service Worker (offline caching)
├── icons/
│   ├── icon-192.png    ← App icon (home screen)
│   └── icon-512.png    ← App icon (splash screen)
└── README.md
```

---

## 🛠️ No Build Step Required

This app uses **React via CDN** + **Babel standalone** — just open `index.html` in a browser or deploy the folder as-is. No `npm install`, no webpack, no build tools.

---

## 💾 Data Storage

All follow-up data is stored in your browser's **localStorage** — it stays on your device and persists between sessions. Use the **Export** feature in Settings to back up your data as a JSON file.

---

## 🔧 Customization

- **Change app name**: Edit `"name"` and `"short_name"` in `manifest.json`
- **Change accent color**: Edit `COLORS.accent` in `index.html`
- **Add default contacts**: Edit the `SAMPLE_CONTACTS` array in `index.html`
- **Add categories**: Use the Settings screen in the app, or edit `DEFAULT_SETTINGS.interestedOptions` in `index.html`

---

## 📄 License

MIT — Free to use, modify, and distribute.

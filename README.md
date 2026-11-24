# NUR: Journey of Light — website

The marketing site for **NUR: Journey of Light** (Android, `com.nur.journeyoflight`).
Static HTML/CSS/JS plus one Vercel serverless function for the live counters.

- 7 languages (en, ar, de, es, fr, pt, zh). The page picks the phone's
  language automatically; visitors can switch from the language menu, and the
  choice is remembered. `?lang=ar` forces a language (handy for sharing).
- Arabic is right-to-left. The screenshots follow the chosen language.
- `/privacy` is the game's privacy policy (link it in Google Play Console).

## Deploy on Vercel

1. Import this repository in Vercel. Framework preset: **Other**. There is no
   build command and no output directory (the root is the site).
2. Live counters (optional but recommended):
   - Vercel → your project → **Storage** (or Marketplace) → add **Upstash for
     Redis** (free plan) and connect it to the project. It adds
     `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` /
     `UPSTASH_REDIS_REST_TOKEN`).
   - Redeploy. The page then shows **Visitors** (one per browser per day) and
     **Sent to Google Play** (taps on the Google Play buttons).
3. Real install count (optional): Google does not publish installs to
   websites. Copy the number from Play Console and set an environment variable
   `NUR_PLAY_INSTALLS`, for example `1,000+`. It appears as
   **Installs on Google Play**. Update it whenever you like and redeploy.

Without storage the site works normally and simply hides the live numbers.

## Files

| Path | What |
| --- | --- |
| `index.html` | The page |
| `css/style.css` | Design (the game's palette, glass panels, motion) |
| `js/i18n.js` | All copy in seven languages |
| `js/app.js` | Language, animations, the swimming swarm, gallery, counters |
| `api/stats.js` | `GET/POST /api/stats` counters (Upstash Redis REST) |
| `assets/` | Art, store screenshots per language, trailer (generated) |
| `privacy/index.html` | Privacy policy (English + Arabic) |

Assets are generated from the game by `D:\NUR\tools\make_website_assets.py`.
Icons: [Lucide](https://lucide.dev) (ISC). Fonts: Poppins, Cairo, Noto Sans SC
(Google Fonts, OFL). Google Play is a trademark of Google LLC.

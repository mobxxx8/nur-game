# NUR: Journey of Light — website

The marketing site for **NUR: Journey of Light** (Android, `com.nur.journeyoflight`),
live at https://nurgame.vercel.app. Plain static HTML/CSS/JS: no build step,
no server code, no tracking.

- 7 languages (en, ar, de, es, fr, pt, zh). The page picks the phone's
  language automatically; visitors can switch from the language menu, and the
  choice is remembered. `?lang=ar` forces a language (handy for sharing).
- Arabic is right-to-left.
- Every "Pick your battle" card plays a real gameplay clip on hover (on
  phones, the card in view plays by itself).
- `/privacy` is the game's privacy policy (link it in Google Play Console).

## Deploy on Vercel

Import this repository in Vercel. Framework preset: **Other**. There is no
build command and no output directory (the root is the site). Every push to
`main` redeploys.

## Files

| Path | What |
| --- | --- |
| `index.html` | The page |
| `css/style.css` | Design (the game's palette, glass panels, motion) |
| `js/i18n.js` | All copy in seven languages |
| `js/app.js` | Language, music, animations, the swimming swarm, mode clips |
| `assets/` | Art, mode cards and clips, trailer, music (generated from the game) |
| `privacy/index.html` | Privacy policy (English + Arabic) |

Assets are generated from the game by `D:\NUR\tools\make_website_assets.py`;
the mode clips by `D:\NUR\tools\make_mode_clips.ps1`.
Background music: the game's menu theme, "In This Moment" by Scott Buckley
(CC BY 4.0, credited in the footer); it starts on the visitor's first tap and
the speaker button turns it off (remembered per browser).
Icons: [Lucide](https://lucide.dev) (ISC). Fonts: Poppins, Cairo, Noto Sans SC
(Google Fonts, OFL). Google Play is a trademark of Google LLC.

# Study path

A free back-end and entry-level AI study guide for Muhammad Osama. Quincy Larson picked the courses and articles in his freeCodeCamp newsletters (December 2024 – October 2026). This site sorts them into a path you can search and filter.

The site is live at [https://learn-backend-and-ai.vercel.app/](https://learn-backend-and-ai.vercel.app/).

The repository is [learn-backend-and-ai](https://github.com/Mogadi/learn-backend-and-ai).

![Study path on a desktop screen: the split hero, four counts, and the start of the collection](docs/screenshot-desktop.png)

![Study path on a phone: the title stacked above the illustration, then the four counts](docs/screenshot-mobile.png)

The visual rules for this page, and for reusing them, are in the [style guide](docs/STYLE-GUIDE.md).

## Features

- Editorial black-and-white layout, with red `#E8432F` and steel blue used sparingly in the illustration and the difficulty key.
- Six study tracks, five starter picks, and the full catalogue. The counts at the top are computed from the data, not typed in by hand.
- Filter by track, and search titles and descriptions.
- A resource that only appeared in a newsletter subject line stays in the list and is marked “no link”.
- Keyboard focus, a skip link, and reduced-motion support. External course links open in a new tab and use `rel="noopener noreferrer"`.
- Layouts for a wide desktop, a tablet, and a narrow phone.

## Tech stack

- HTML, CSS, and JavaScript. No framework and no build step.
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) for display type and [DM Sans](https://fonts.google.com/specimen/DM+Sans) for text, both from Google Fonts.
- Any static file host. The repository root is the site.

## Project structure

```text
index.html              Home page
404.html                Unknown-path page, for static hosts
site.webmanifest        Name, colours, and icons for installed copies
favicon.ico             Fallback icon requested at the site root
css/styles.css          All of the layout and component styles
js/courses.js           Picks and catalogue
js/main.js              Filters, search, and the counts
assets/                 Favicon set, maskable icon, and the 1200×630 social image
docs/STYLE-GUIDE.md     Colour, type, layout, and component rules
docs/screenshot-*.png   Desktop and mobile views of the home page
LICENSE                 MIT
```

To add a resource, edit `js/courses.js`. A pick is `[title, detail, url]`. A catalogue item is `[title, length, level, description, url]`. The level is `"b"`, `"i"`, `"a"`, or `"n"`. Use `null` for the URL when there is no article to open. Do not hard-code the four counts; the page calculates them.

## Run it locally

From the repository root:

```bash
python3 -m http.server 8741
```

Then open [http://127.0.0.1:8741](http://127.0.0.1:8741).

There is nothing to install. A local server is the reliable way to preview it. The page also opens from the file itself in most browsers, because the scripts are ordinary deferred files rather than modules.

## Deploy

The site is a folder of static files. Do not set a build command.

### Vercel

1. Import [Mogadi/learn-backend-and-ai](https://github.com/Mogadi/learn-backend-and-ai).
2. Set the framework preset to **Other**.
3. Leave the build command empty. The output directory is the repository root.
4. Deploy. `/` serves `index.html`. Unknown paths use `404.html`.

### GitHub Pages

1. In [learn-backend-and-ai](https://github.com/Mogadi/learn-backend-and-ai), open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose the `main` branch and the `/ (root)` folder.
4. Save. Pages publishes the same files at `https://mogadi.github.io/learn-backend-and-ai/`.

Asset paths are relative, so that project-site subpath still finds the CSS, scripts, and icons.

Link-preview crawlers need absolute image URLs. The live site at `https://learn-backend-and-ai.vercel.app/` uses these in the `<head>` of `index.html`:

```html
<link rel="canonical" href="https://learn-backend-and-ai.vercel.app/">
<meta property="og:url" content="https://learn-backend-and-ai.vercel.app/">
<meta property="og:image" content="https://learn-backend-and-ai.vercel.app/assets/og.png">
<meta name="twitter:image" content="https://learn-backend-and-ai.vercel.app/assets/og.png">
```

`assets/og.png` is already a 1200×630 image in the page’s style.

## Credits

- Quincy Larson chose these resources in the freeCodeCamp newsletter. The footer date, 6 November 2026, is when this copy of the list was assembled.
- The courses and articles are published by [freeCodeCamp](https://www.freecodecamp.org/news/). This study guide links to them. It is not an official freeCodeCamp site, and the MIT license below does not relicense that work.
- Made for Muhammad Osama, a back-end student in Rwanda.
- Space Grotesk and DM Sans are used under the [SIL Open Font License](https://openfontlicense.org/).

## License

[MIT](LICENSE) © 2026 Muhammad Osama.

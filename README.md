# Xuanqi · Shang-Style Divination

A dark Shang-dynasty-inspired traditional divination website built around a red, white, and black visual system, featuring bronze masks with round eyes and exposed teeth, turtle plastrons, and animated crack-divination effects.

After the user submits a question, the site simultaneously displays a Classical Chinese divination text, a modern-language interpretation, and transparent calculation details that can be independently checked.

This is the complete runnable project as of October 2, 2026. It includes all current HTML, CSS, JavaScript, images, calendrical libraries, Chinese technical documentation, numerical export examples, and GitHub Pages deployment configuration.

## Features

| Module | Current Calculations and Outputs | Implementation |
| --- | --- | --- |
| Beijing Time | Reads the device's current time automatically and converts it to UTC+8. The timestamp is fixed when a divination session begins. | `dist/engine.js`, `dist/app.js` |
| Xiao Liu Ren | Calculates the six palaces by sequential counting from lunar month, lunar day, and traditional hour, and displays both the resulting palace and calculation process. | `smallRen()` |
| Da Liu Ren Four Lessons | Includes solar-term-based month general, month-general-over-hour configuration, Heaven and Earth plates, stem palace assignments, Four Lessons, and Five-Element generating and controlling relations. | `sixRen()` |
| Plum Blossom Numerology | Converts year, month, day, and hour into numerical values and derives the original hexagram, changed hexagram, moving line, body/use relation, and Five-Element interaction. | `meihua()` |
| Four Pillars | Converts birth time using an IANA timezone and calculates year, month, day, and hour pillars, together with Five Elements and Na Yin classifications. | `birthChart()` |
| Turtle-Plastron Synthesis | Maps the three divination systems into three crack categories: open omen, contracting omen, and intersecting omen. Four Lessons determine secondary crack expansion, while the moving line determines the red marker position. | `dist/turtle.js` |
| Visualization | Includes six-palace highlighting, Four-Lesson vertical layouts, Heaven/Earth plate comparison, six-line hexagram diagrams, Four-Pillar cards, SVG crack patterns, and animated heat points. | `dist/app.js`, `dist/turtle.js`, two CSS files |
| Quantitative Export | Exports direction encoding, Four-Lesson net score, three-method vote counts, hexagram numbers, moving-line index, and crack-scaling parameters. CSV export is supported. | `examples/quantify.cjs`, `export-series.cjs` |

### Scope

The current Da Liu Ren implementation includes the Heaven and Earth plates and the Four Lessons.

It does **not** currently implement:

- Three Transmissions
- Twelve Heavenly Generals
- Nine Transmission Methods

The turtle-plastron system uses a transparent modern synthesis rule designed specifically for this project. It is **not** presented as a reconstruction of historical Shang-dynasty crack interpretation.

All numerical values represent rule-based encodings, structural scores, or geometric parameters. They are **not** event probabilities and do not constitute an empirically validated predictive model.

## Local Development

Install Node.js 22 or later, then run the following command from the project root:

```bash
npm start
```

Open:

```text
http://127.0.0.1:4173
```

No `npm install` step is required because the project has no third-party npm dependencies.

You may also run a simple Python HTTP server from the `dist` directory:

```bash
python3 -m http.server 4173
```

Opening `dist/index.html` directly will allow most functions to work, but running the project through a local HTTP server is recommended for full preview and testing.

## Publish on GitHub Pages

1. Extract the project and enter the `xuanqi-github` directory.
2. Create a new **Public** GitHub repository, for example `xuanqi-oracle`.
3. Upload all files from this folder directly into the repository root, including `.github/workflows/pages.yml`.
4. Do not upload only the ZIP archive, and do not place the project inside an additional nested folder.
5. Open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
6. In the **Actions** tab, run `Publish Xuanqi to GitHub Pages`.
7. Future pushes to the `main` branch will trigger automatic deployment.

GitHub Pages is available for public repositories at no cost.

The deployed URL will usually follow this format:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

The actual URL shown in the GitHub Pages settings page should be treated as authoritative.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for detailed deployment instructions.

## Validation and Data Export

Run:

```bash
npm run check
npm test
node examples/calculate.cjs > result.json
node examples/export-series.cjs 2026-10-01T00:00:00Z 24 120 > series.csv
```

The final command generates 24 rows beginning at the specified UTC timestamp, with one row every 120 minutes.

The resulting CSV can be opened directly in Excel or processed with Python, R, visualization tools, or other analytical software.

Questions and example birth information included in the repository are demonstration inputs only.

## Project Structure

| Directory / File | Purpose |
| --- | --- |
| `dist/` | Complete deployable website |
| `dist/assets/` | Two artwork images, full calendrical library code, and the corresponding MIT license |
| `docs/ALGORITHMS.md` | Full formulas, encodings, Five-Element mappings, and turtle-omen decision rules |
| `docs/VISUALIZATION.md` | Visualization architecture, data bindings, animation logic, and styling entry points |
| `docs/API.md` | Browser and Node usage, inputs, outputs, and linked divination interfaces |
| `docs/DEPLOYMENT.md` | GitHub upload instructions, free Pages deployment, and troubleshooting |
| `docs/PROJECT-NOTES.md` | Current version information, dependencies, scope limitations, completed validation, and future modification entry points |
| `examples/` | Single-result examples, batch numerical export tools, and fixed sample data |
| `scripts/` | Local server and resource validation scripts |
| `tests/` | Reproducible regression tests for calendrical calculations, timezone conversion, linked logic, and geometry |
| `.github/workflows/pages.yml` | GitHub Pages deployment workflow |
| `THIRD_PARTY_NOTICES.md` | Licensing and attribution information for the calendrical library, images, and fonts |

## Data and Privacy

All calculations are performed locally in the browser.

User questions and birth information are not uploaded or stored by the project.

The only external styling request is for Google Fonts. If those fonts are unavailable, the site falls back to system fonts without affecting any calculations.

Reference links included in the documentation are accessed only when the user explicitly clicks them.

## Licensing

The calendrical library `lunar-javascript` is distributed under the MIT License, and its original license text is preserved in the repository.

The project's original source code has not yet been released under an open-source license.

The `package.json` file is currently marked:

```text
UNLICENSED
```

A separate license may be added later if public reuse, modification, or redistribution is intentionally permitted.

## Technical and Historical References

- [GitHub Pages: Using custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [lunar-javascript](https://github.com/6tail/lunar-javascript)
- [Da Liu Ren Da Quan, Volume 1](https://zh.wikisource.org/wiki/六壬大全_(四庫全書本)/卷01)
- [Plum Blossom Numerology, Volume 1](https://ctext.org/wiki.pl?chapter=867487&if=gb)

## Disclaimer

This project is intended for cultural exploration and entertainment.

The Classical Chinese divination texts displayed by the website are modern compositions written in a historical style.

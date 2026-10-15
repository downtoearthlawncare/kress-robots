# Kress Robotic Mowers page

A page for the Down to Earth Lawn Care website that shows every Kress robotic mower with the prices listed on kress.com. Every morning it checks Kress's site and updates the models and prices on its own.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The page customers see. Brand colors are at the top of the file (`--brand`, `--accent`). |
| `data/robots.json` | Today's list of Kress models and prices. Updated automatically every day. |
| `scripts/sync-kress.js` | Downloads Kress's robotic mower page and saves the models and prices. |
| `scripts/parse-kress.js` | Reads the models, prices, sale prices, lawn sizes and features from Kress's page. |
| `.github/workflows/sync-kress.yml` | Runs the update every day at 6 AM Central. |

## Live page

https://downtoearthlawncare.github.io/kress-robots/

## Put it on the GoDaddy website

1. In GoDaddy Website Builder, open the **Kress Robotic Mowers** page and click **Edit Website**.
2. Add a section → **HTML** (sometimes called "Embed" or "Custom code").
3. Paste this:

```html
<iframe src="https://downtoearthlawncare.github.io/kress-robots/"
        style="width:100%; height:2400px; border:0;"
        title="Kress robotic mowers" loading="lazy"></iframe>
```

4. Preview on desktop and phone, adjust the `height` if the list is cut off or leaves a big gap, then **Publish**.

## Good to know

- **If Kress changes their website** and the update can't read it, the page keeps showing the last good prices. GitHub emails the account owner that the daily run failed.
- **New or discontinued models** show up or disappear automatically.
- **Sale prices** show with a strikethrough of the regular price and an "On sale" badge.
- **Photos** load from kress.com.
- **Manual update:** Actions → Daily Kress price sync → Run workflow.

# páramo ring

A tiny webring for Colombian builders — personal sites and projects, linked together the old-web way. No algorithm, no feed, just people linking to people.

This repo *is* the whole project: there's no hosted homepage. Member data lives in [`members/`](./members), the embeddable widget is [`embed.js`](./embed.js), and both are served straight out of this repo via [jsDelivr](https://www.jsdelivr.com/).

## Join the ring

**1. Add the widget to your site**

```html
<div data-paramoring="your-slug"></div>
<script src="https://cdn.jsdelivr.net/gh/dejesusbg/paramo-ring@main/embed.js" defer></script>
```

Replace `your-slug` with the filename (no `.json`) you'll use in the next step. This renders a small ← [icon] → nav: the arrows link to the previous/next site in the ring, and the icon links back to this repo.

**2. Create your member file**

Add `members/your-slug.json`:

```json
{
  "name": "Your Name",
  "url": "https://your-site.example",
  "active": true
}
```

The filename (without `.json`) must be lowercase letters, digits, and hyphens only, and becomes the `data-paramoring` slug from step 1.

**3. Open a pull request**

A GitHub Action checks your file (valid JSON, allowed fields, unique slug/URL, HTTPS, and that the site is reachable) and comments the result on your PR. Once it's merged, `members.json` and the table below regenerate automatically and your site joins the ring.

## Members

<!-- members:start -->
| Member |
| --- |
| [Ricardo Barrios](https://dejesusbg.netlify.app) |
<!-- members:end -->

## License

[MIT](./LICENSE)

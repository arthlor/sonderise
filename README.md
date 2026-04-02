# Sonderise

Sonderise is a newspaper-style publishing theme for [EmDash](https://github.com/emdash-cms/emdash), built with Astro and configured for Cloudflare Workers, D1, and R2.

The default seed ships as **The Sonderise Chronicle**: a warm editorial layout with a masthead, section navigation, front-page lead story, desk-style category blocks, longform article rails, archive search, and dark mode.

## Theme Highlights

- Newspaper masthead powered by EmDash site settings, menus, and taxonomies
- Editorial homepage with a lead story, supporting columns, briefing rail, and category desks
- Longform article template with byline rail, table of contents, widget sidebar, and related stories
- Archive and taxonomy pages styled as section fronts instead of generic blog lists
- Search page backed by EmDash indexed search
- RSS feed that reads branding from EmDash site settings
- Token-driven palette and typography in a dedicated theme file
- Cloudflare-ready EmDash setup with forms and webhook notifier plugins

## EmDash Integration

This theme is not just a CSS skin. It is wired into EmDash’s content model:

- `getSiteSettings()` drives the publication title, tagline, and RSS branding
- `getMenu("primary")` powers the main navigation
- `getTaxonomyTerms("category")` powers section navigation and homepage desks
- `getEntryTerms()` powers per-post section labels and tag displays
- `getSection()` powers reusable theme-owned editorial blocks like newsletter and author notes
- `WidgetArea` renders footer and article sidebar widgets
- `search()` powers the dedicated search page

## Key Files

| File | Purpose |
|---|---|
| `src/layouts/Base.astro` | Shared newspaper shell, masthead, navigation, search, footer, and theme switching |
| `src/pages/index.astro` | Front page layout with lead story, briefing column, and section desks |
| `src/pages/posts/[slug].astro` | Longform article layout with metadata rail, TOC, widgets, comments, and related stories |
| `src/pages/posts/index.astro` | Story archive layout |
| `src/pages/category/[slug].astro` | Category desk archive |
| `src/pages/tag/[slug].astro` | Tag archive |
| `src/pages/search.astro` | Search page backed by EmDash search |
| `src/styles/theme.css` | Theme tokens for palette, typography, spacing, and dark mode |
| `seed/seed.json` | Default publication settings, menus, sections, widget areas, and starter content |

## Local Development

Install dependencies:

```bash
npm install
```

Start the local EmDash development environment:

```bash
npx emdash dev
```

Useful routes:

- Site: `http://localhost:4321`
- Admin: `http://localhost:4321/_emdash/admin`

## Validation

Run Astro checks:

```bash
npm run typecheck
```

Build for production:

```bash
npm run build
```

## Deploying

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Deploy your own copy of this template

If you fork or clone this repository for your own publication, update the
Cloudflare resource names before your first deploy.

Edit:

```text
wrangler.jsonc
```

Replace the default values with your own names:

- `name`: your Worker name
- `d1_databases[0].database_name`: your D1 database name
- `r2_buckets[0].bucket_name`: your R2 bucket name

Example:

```json
{
  "name": "my-paper",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-paper-db"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA",
      "bucket_name": "my-paper-media"
    }
  ]
}
```

Important:

- The Cloudflare project/Worker name should match `wrangler.jsonc`
- Keep the binding names as `DB` and `MEDIA`
- Only rename the resource names, not the bindings

If you deploy from the Cloudflare dashboard using Git:

1. Connect your own GitHub repository
2. Set the project name to match `wrangler.jsonc`
3. Use `npm run build` as the build command
4. Use `npm run deploy` or `npx wrangler deploy` as the deploy command
5. Create or select your own D1 database and R2 bucket using the same names you configured in `wrangler.jsonc`

After that, pushes to your production branch will deploy your own copy of the
theme instead of the default `sonderise` resources.

## Customizing The Theme

### Update publication identity

Change the default site title, tagline, footer copy, and theme-owned content sections in:

```text
seed/seed.json
```

After changing the seed, run `npx emdash dev` so EmDash can apply the updates locally.

### Retheme the look

Adjust the visual system in:

```text
src/styles/theme.css
```

This file controls:

- light and dark color tokens
- serif, sans, display, and mono font stacks
- type scale and tracking
- layout widths and article rails
- borders, shadows, and masthead proportions

### Change structure

If you want a different editorial layout, start here:

- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `src/pages/posts/[slug].astro`

## Included Content Model

The default seed includes:

- `posts` and `pages` collections
- `category` and `tag` taxonomies
- bylines for editorial and guest contributors
- a primary navigation menu
- footer and article sidebar widget areas
- reusable sections for newsletter signup and author information

## Stack

- Astro
- EmDash CMS
- Cloudflare Workers
- Cloudflare D1
- Cloudflare R2
- `@astrojs/cloudflare`
- `@emdash-cms/plugin-forms`
- `@emdash-cms/plugin-webhook-notifier`

## Notes

- This repo is configured for server rendering.
- CMS images should be rendered with `Image` from `emdash/ui`.
- EmDash content pages should keep using route-cache hints from query responses.

## Documentation

- [EmDash documentation](https://docs.emdashcms.com)
- [EmDash source](https://github.com/emdash-cms/emdash)

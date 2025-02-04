# Blaze Dashboard App

Blaze Dashboard is built as a standalone application to be used inside Jetpack, and in the future, into WooCommerce. The Jetpack counterpart of the project is in [here](https://github.com/Automattic/jetpack/tree/trunk/projects/packages/blaze).

## Hiarachy

```
.
└── src/
    ├── components/       ← blaze dashboard app only components. For now there is only a layout component.
    ├── page-middleware/  ← page.js integration with React and everything
    ├── app.js            ← entry point
    └── routes.js         ← page.js routes
```

## Routing

It utilizes the [hashbang (#!) in page.js](https://github.com/visionmedia/page.js), however it doesn't work out of the box, because we are using hardcoded paths in Calypso, so some tricks are done in Jetpack to intercept the anchor clicks and convert them to hashbangs.

```
$("#wpcom").on('click', 'a', function (e) {
	const link = e && e.currentTarget && e.currentTarget.attributes && e.currentTarget.attributes.href && e.currentTarget.attributes.href.value;
	if( link && ! link.startsWith( 'http' ) ) {
		location.hash = `#!${link}`;
		return false;
	}
});
```

## Gridicon

The `Gridicon` in `@automattic/components` leverages `<use>` to load SVG sprites and has issues when loading from CDN (i.e. other than the main domain). So we had to replace with one that doesn't load the SVG sprite file - `packages/components/src/gridicon/no-asset.tsx` - and then in Jetpack, we load it separately:

```
$.get("https://widgets.wp.com/blaze-dashboard/common/gridicons-506499ddac13811fee8e.svg", function(data) {
	var div = document.createElement("div");
	div.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
	div.style = 'display: none';
	document.body.insertBefore(div, document.body.childNodes[0]);
});
```

## Building

### Production

```bash
cd apps/blaze-dashboard
yarn build
```

### Development with local Jetpack

1. Ensure you have a working local Jetpack installation
2. Run `BLAZE_DASHBOARD_PACKAGE_PATH=/path/to/jetpack/projects/packages/blaze yarn dev`

## Development with sandbox

1. Ensure you have a working sandbox and the its hostname is `wpcom-sandbox`
2. Run `yarn dev --sync` to build and sync files as you change them.

## Uploading to CDN

The path is `widgets.wp.com/blaze-dashboard`.

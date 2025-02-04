# Icons

This document will cover how to use icons in Calypso, as well as how to create icons for the native apps, favicons, and bookmark touch icons.

## @wordpress/icons

As of January 2024, there has been a shift in the approach to icons within Calypso. While Gridicons have served us well in the past, the WordPress community is increasingly adopting [@wordpress/icons](https://www.npmjs.com/package/@wordpress/icons) for [a more standardized and cohesive experience across WordPress interfaces](https://github.com/WordPress/gutenberg/issues/20284).

`@wordpress/icons` are designed to align with WordPress's overall design language and provide a consistent user experience. You can browse the icons docs and examples at <https://wordpress.github.io/gutenberg/?path=/story/icons-icon--library>.

For existing implementations using Gridicons or Material Icons, plan for a gradual migration to `@wordpress/icons`. If you are an Automattician, please refer to p7H4VZ-4JT-p2.

### Usage

```js
import { Icon, check } from '@wordpress/icons';

<Icon icon={ check } />;
```

### Contributing to Icon Sets

Contributions to `@wordpress/icons` are encouraged, as they benefit both WordPress.com and the open-source community. If you have suggestions or new icons to add, please refer to [the contribution guidelines on the Gutenberg repo](https://github.com/WordPress/gutenberg#contribute-to-gutenberg). If you are an Automattician, you can check PuPv3-aHW-p2 and puPv3-8Mr-p2 out.

## App icons

WordPress apps for iOS, OSX, Android and even the favicons share the same overarching style:

- Flat in design, using the single-ring WordPress logo
- Background is [Medium Blue](https://wordpress.com/design-handbook/colors/)
- Logo is white

It was decided to make the icons medium blue instead of WordPress.com blue for contrast reasons. When updating or creating new versions of the icons, use the existing Sketch templates for iOS and Android for generating new icons. These are already adjusted to individual platform standards.

### Favicon

The favicon requires additional work, as it needs to be highly compressed and work at tiny sizes:

- Do use the same general general design guidelines as the apps, medium blue and white.
- Don't use roundrects or squares, use a circle
- Don't bake in a drop shadow into the icon

The 16px icon is the important one. It needs extra pixelhinting in order to work. But do any larger sizes (32, 64, 96) on the same grid as the 16px ones, don't change the design just because there are more pixels to work with. The 192px version is used by Android bookmarks, so if you like you can use the Android icon of the same size for this resolution.

Once the favicons and saved as high quality PNGs, are designed, run the files through [ImageAlpha](https://pngmini.com/) to compress them as much as you can. The best way to compress them is to reduce the number of colors in the image. This app is amazing for that. You can shave off up to 70% of the filesize by reducing from 256 to maybe 32 colors, whatever is visually sufficient. Once they're through ImageAlpha, run them through [ImageOptim](https://imageoptim.com/) for further shavings.

Finally, build the favicon. Only include 16 and 32px sizes directly in the .ico file. If you need a 64px version, include it through a separate meta tag:

`<link rel="icon" type="image/png" href="favicon-64x64.png" sizes="64x64">`

### More resources

- [Favicon Cheat Sheet](https://github.com/audreyr/favicon-cheat-sheet)
- [Favicon Quiz](https://css-tricks.com/favicon-quiz/)

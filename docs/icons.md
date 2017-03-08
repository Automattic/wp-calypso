# Icons

This document will cover how to use icons in Calypso, as well as how to create icons for the native apps, favicons, and bookmark touch icons.

## Gridicons

[Gridicons](https://github.com/Automattic/gridicons) is the icon set designed from the bottom up for Calypso. It features a consistent style.

Gridicons are born with a 24px base grid. Strokes are 2px thick and icons are solid. If an icon is hollow, it generally means the "inactive" version of that icon. For example an outline bookmark icon becomes solid once clicked.

Though Gridicons are vector graphics and theoretically infinitely scalable, in practice we have to work within the limitations of antialiasing so icons stay crisp. Since Gridicons are designed for 24px, they look perfect at that size. That's why by default, this is the size you should be using.

If you need to use icons that are *larger* than 24px, other perfect sizes are 2x duplicates, such as 48px. You can use 36px as well but this will require the use of an additional `offset-adjust` feature we're working on at the moment.

Same thing if you need *smaller* than 24px icons. At this size, gridicons will look blurry, so you should **avoid this if at all possible**. 18px icons will not do for main navigation, for example.

### The `offset-adjust` Hack

Some icons at 18 and 36px size needs an extra feature in order to look crisp. The code looks like this:

```
.offset-adjust {
    transform: translate(.5px, .5px);
}
```

What this basically does is nudge the pixels up and to the left by half a pixel. In the case of 36px icons (1.5 * 24) what it means is that icons can be **perfectly crisp**. In the case of 18px icons, it means icons will be **crisper**, though not perfect. Just trust me on the math.

The tricky part is that not all icons need this `offset-adjust` hack, only some icons do. We are currently working out how to best roll this feature out.

### Do's and Don'ts

- Do use Gridicons at 24px or 48px
- Do use Gridicons at 36px if you add the `offset-adjust` hack on a per-icon basis
- Only use 18px Gridicons if you really must, and don't use it in main navigation
- Don't use Noticons or Dashicons (we want to phase them out)


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

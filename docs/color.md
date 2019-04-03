# Color

This document provides guidance on the technical use of color in Calypso. Please see our documentation on our [Brand Guide](https://dotcombrand.wordpress.com/colors/) for guidance related to general color usage.

## CSS Custom Properties

We use CSS custom properties for all color usage. Unless an edge case requires another solution, only CSS custom properties should be used.

## Semantic Variables

Our naming is based on function and describes the meaning of the color, not the color name itself. This makes maintenance easier, and keeps the focus on **communication over decoration.** [View our colors file](https://github.com/Automattic/wp-calypso/blob/master/packages/calypso-color-schemes/src/shared/_color-schemes.scss) to see all variables, or continue reading for a description.

**Common Variables**

| Variable          | Description                  |
| ----------------- | ---------------------------- |
| `--color-primary` | Primary color                |
| `--color-accent`  | Accent (aka secondary) color |
| `--color-neutral` | Gray color                   |
| `--color-success` | Success status               |
| `--color-warning` | Warning status               |
| `--color-error`   | Error status                 |


The colors above can be suffixed with `-light` or `-dark` to quickly get a variation of the color. They are helper aliases to make picking shades easier (e.g. `--color-primary-light` or `--color-primary-dark`). These suffixes correspond to the 300 and 700 value of that color. For example, **Blue 300** is equal to `--color-primary-light`, and **Blue 700** is equal to `--color-primary-dark`.

The variables listed above can also be suffixed with the corresponding value number as shown on [Color Studio](https://automattic.github.io/color-studio/). If you need a specific value that is not covered by the `light` or `dark` helper aliases, then you can append the specific value number to the end of the variable. For example, you can use `--color-accent-100` or `color-neutral-900` to get a specific shade.

**Additional Variables**

We also have variables that help make our color usage consistent, while also making updates easier to maintain.

| Variable                | Description                                |
| ----------------------- | ------------------------------------------ |
| `--color-text`          | Default text color                         |
| `--color-text-subtle`   | Less prominent text color                  |
| `--color-border`        | Border for UI components                   |
| `--color-border-subtle` | Less prominent border for cards and layout |
| `--color-link`          | Hyperlink color                            |
| `--color-white`         | Pure white                                 |

## Adding Transparency to a Color

Because we have a full range of shades available, we shouldn’t use transparency to generate different shades of a color. In cases where transparency is needed (e.g. shadows and overlays), we must use a special `-rgb` suffix on our variable:


    .my-selector {
      border-color: rgba( var( --color-primary-rgb ), 0.5 );
    }

All of our semantic variables all have the `-rgb` suffix available. If you need the rgb version of a color, just add `rgb` at the end. By using this variable with `rgba()` you can apply transparency to a color. Here’s how we convert the color to use rgb:


    :root {
      --color-primary: #{ $blue-500 }; // the normal hex version
      --color-primary-rgb: #{ hex2rgb( $blue-500 ) }; // converted to a rgb triple
    }
    
# Dashboard Color Schemes

WordPress.com provides the ability to change the colors used on the dashboard. Currently, only the primary, secondary, and navigation drawer colors are changed. Please keep the schemes in mind while implementing new designs.

![WordPress.com color schemes](https://d2mxuefqeaa7sj.cloudfront.net/s_FEA99DC44F88B73D99F6B143E998C6E4C2EFC182F0D1F24C5742C8FE7A343648_1548279119167_Screen+Shot+2019-01-23+at+3.17.09+PM.png)

## Brand Colors

If a brand color is needed, then the appropriate color variable should be used so that it remains constant across all schemes. For example, use the `--color-wpcom` variable instead of `--color-primary` when applying color to the WordPress.com logo. This will ensure that it uses Product Blue, even if the customer changes dashboard schemes.

![The WordPress.com logo uses Product Blue](https://d2mxuefqeaa7sj.cloudfront.net/s_FEA99DC44F88B73D99F6B143E998C6E4C2EFC182F0D1F24C5742C8FE7A343648_1548279432982_Screen+Shot+2019-01-23+at+3.35.11+PM.png)

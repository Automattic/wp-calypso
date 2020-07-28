# Typography

@automattic/typography is a Sass file for shared typographic elements across WordPress.com products. Right now, this package contains the `@font-face` declaration for the WordPress.com brand font.

## Installation

```sh
yarn add @automattic/typography
```

## Usage

Import the Sass file:

`@import '~@automattic/typography/styles/fonts';`

Then apply the class name `wp-brand-font` to any elements that should display with Recoleta:

`<h1 className="wp-brand-font">Brand font heading</h1>`

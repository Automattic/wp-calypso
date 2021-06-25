# Typography

@automattic/typography is a Sass file for shared typographic elements across WordPress.com products. This package contains

- the `@font-face` declaration for the WordPress.com brand font
- font-size sass variables
- font-family sass variables

## Installation

```sh
yarn add @automattic/typography
```

## Usage

Note that this package contains two sass files and there are use cases for `@import`ing either file.

### Import the `variables.scss` file

`@import '@automattic/typography/styles/variables';`

Apply font variables as needed:

```
.my-text {
    font-size: $font-body-small;
}
```

### Import the `fonts.sccc` file

`@import '@automattic/typography/styles/fonts';`

Extend the .wp-brand-font selector in your SCSS:

```
.design__typography-branded {
	@extend .wp-brand-font;
	font-size: $font-title-medium;
}
```

Or apply the class name `wp-brand-font` to any elements that should display with Recoleta:

`<h1 className="wp-brand-font">Brand font heading</h1>`

Note that the `fonts.scss` file imports the `variables.scss` file.

<br>

Please refer to the [Calypso Typography Docs](https://wpcalypso.wordpress.com/devdocs/typography) for more information.

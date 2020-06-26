# Typography

`@automattic/typography` are collection of Sass files for shared typographic elements across WordPress.com products.

## Installation

```sh
yarn add @automattic/typography
```

## Usage

Import the Sass files you need:

```scss
@import '~@automattic/typography/sass/font-brand';
@import '~@automattic/typography/sass/font-family';
@import '~@automattic/typography/sass/font-size';
```

### Using brand font

Imported `font-brand.scss` file contains the `@font-face` declaration for the WordPress.com brand font Recoleta.

Apply the class name `wp-brand-font` to any elements that should display with Recoleta:

```jsx
<h1 className="wp-brand-font">Brand font heading</h1>
```

The package does not ship with the font files itself.

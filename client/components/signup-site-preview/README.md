# Signup Site Preview

This component displays a WordPress.com site preview, used by the signup journey to display site preview with mocked content.

```javascript
<SignupSitePreview
	defaultViewportDevice="desktop"
	fontUrl="http://path.to.css.font.file"
	cssUrl="http://path.to.theme.css.file"
	content={ {
		title: 'Greetings',
		tagline: 'Earthlings!',
		body: '<strong>Take me to your pizza!</strong>',
	} }
	langSlug="en"
	isRtl={ false }
	onPreviewClick={ this.handlePreviewClick }
	resize
	scrolling={ false }
	className="sophisticated"
/>;
```

## Props

### _(String)_ `className`

_Optional_ A custom class name for the iframe wrapper

### _(String)_ `defaultViewportDevice`

Determines the width and style of the iframe container. Valid values: `desktop` or `phone`

### _(Object)_ `content`

Contains the title, tagline and body content in the WordPress.com site preview.

### _(Boolean)_ `resize`

_Optional_ Whether the iframe container should resize according to the iframe content height, and update on window resize.

Default: `false`

### _(Boolean)_ `scrolling`

_Optional_ Whether the iframe container should scroll overflowing content.

Default: `true`

### _(String)_ `langSlug`

Site language, added as to `<html />` as a `lang` attribute

### _(Boolean)_ `isRtl`

Whether the language is a right-to-left language. If `true`, we add `"rtl"` to `<html />` as a `dir` attribute.

Default: `false`

### _(String)_ `cssUrl`

Url to a theme CSS file.

### _(String)_ `fontUrl`

_Optional_ Url to a CSS font file, for example, from Google fonts.

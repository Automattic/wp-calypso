Signup Site Preview
=============

This component displays a WordPress.com site preview, used by the signup journey to display site preview with mocked content.

```javascript

	<SignupSitePreview
		defaultViewportDevice="desktop"
		fontUrl="http://path.to.css.font.file"
		cssUrl="http://path.to.theme.css.file"
		content={
			{
				title: 'Greetings',
				tagline: 'Earthlings!',
				body: '<strong>Take me to your pizza!</strong>',
			}
		}
		langSlug="en"
		isRtl={ false }
		onPreviewClick={ this.handlePreviewClick }
	/>
					
```


## Props

### _(String)_ `defaultViewportDevice`
Determines the width and style of the iframe container. Valid values: `desktop` or `phone`

### _(Object)_ `content`
Contains the title, tagline and body content in the WordPress.com site preview.

### _(String)_ `langSlug`
Site language, added as to `<html />` as a `lang` attribute

### _(Boolean)_ `isRtl`
Whether the language is a right-to-left language. If `true`, we add `"rtl"` to `<html />` as a `dir` attribute. 

### _(String)_ `cssUrl`
Url to a theme CSS file.

### _(String)_ `fontUrl`
_Optional_ Url to a CSS font file, for example, from Google fonts.


Social Logo
========

Component that renders a single socail-logo svg based on an `icon` prop. It takes a size property but defaults to 24px. For greater sharpness, the icons should only be shown at either 18, 24, 36 or 48px. There's a gallery with all the available icons in devdocs/design.

#### How to use:

```js
let SocialLogo = require( 'components/social-logo' );

render() {
	return <SocialLogo icon="twitter" size={ 48 } />;
}
```

#### Props

* `icon`: String - the icon name.
* `size`: Number - (default: 24) set the size of the icon.
* `onClick`: Function - (optional) if you need a click callback.

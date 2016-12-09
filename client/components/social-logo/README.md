Social Logo
========

External component that renders a single [social-logo](https://wpcalypso.wordpress.com/devdocs/design/social-logos) svg based on an `icon` prop. It takes a size property but defaults to 24px. For greater sharpness, the icons should only be shown at either 18px, 24px, 36px or 48px. There's a gallery with all the available icons [here](https://wpcalypso.wordpress.com/devdocs/design/social-logos).

#### How to use:

```js
import SocialLogo from 'social-logos';

render() {
	return <SocialLogo icon="twitter" size={ 48 } />;
}
```

#### Props

* `icon`: String - the icon name.
* `size`: Number - (default: 24) set the size of the icon.
* `onClick`: Function - (optional) if you need a click callback.

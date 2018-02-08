Themes Banner
=============

This component is used to implement a banner with image, text, and button.

#### How to use:

```jsx
import { ThemesBanner } from './themes-banner';

const SampleBanner = () => (
	<ThemesBanner
		title={ translate( 'Are you a small business?' ) }
		description={ translate(
			"We understand your time contraints, and that's why we created this easy-to-set-up Premium theme called Small Business."
		) }
		action={ this.buttonAction }
		actionLabel={ translate( 'Learn about this theme' ) }
		backgroundImage="/calypso/images/example/background.jpg"
		href="https://wordpress.com"
	/>
);
```

When both `action` and `href` are specified, the callback will run first, then the URL will be followed.

#### Props

The following props are used to control the display of the component. The presence of a `href` prop determines whether an anchor element is rendered instead of a button.

* `title`: (string) Title to use for the banner. 
* `description`: (string) Description to use for the banner, displays below the title.
* `action`: (function) Callback to run when the banner's button is clicked.
* `actionLabel`: (string) Label to use for the button.
* `backgroundImage`: (string) URL to use for the banner's background image.
* `href`: (string) URL to visit when clicking the button.

Themes Banner
=============

This component is used to implement a banner with image, text, and button.

#### How to use:

```jsx
import { ThemesBanner } from './themes-banner';

const SampleBanner = () => (
	<ThemesBanner
		themeId={ 'photo-blog' }
		themeName={ 'Photo Blog' }
		title={ translate( 'Are you a photographer? An artist?' ) }
		description={ translate( 'An awesome theme description for the theme' ) }
		buttonLabel={ translate( 'See the theme' ) }
		backgroundColor={ '#3FE6AF' }
		image={ '/calypso/images/themes-banner/photo-blog.png' }
		imageTransform={ 'translateX(17%)' }
		imageAttrs={ {
			width: 390,
		} }
	/>
);
```

#### Props

The following props are used to control the display of the component.

* `themeId`: (string) The ID of the theme
* `themeName`: (string) Name of the theme
* `title`: (string) Title to use for the banner
* `description`: (string) Description to use for the banner
* `buttonLabel`: (string) Label to use for the banner's button
* `backgroundColor`: (string) Hex color to use for the banner background
* `image`: (string) Image path to use for the banner image
* `imageTransform`: (string) The CSS transform properties to be applied to the image
* `imageAttrs`: (object) Additional attributes to pass to the image (width, height, etc)

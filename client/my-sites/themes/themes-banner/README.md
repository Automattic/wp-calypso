Themes Banner
=============

This component is used to implement a banner with image, text, and button.

#### How to use:

Add the following code into the same directory of this README file.

```jsx
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import ThemesBanner from './index';

class SmallBusinessBanner extends PureComponent {
	render() {
		const { translate } = this.props;
		return (
			<ThemesBanner
				themeId={ 'small-business' }
				themeName={ 'Small Business' }
				title={ translate( 'Do you run a small business?' ) }
				description={ 'An awesome description for this theme' }
				buttonLabel={ translate( 'See the theme' ) }
				backgroundColor={ '#3d596d' }
				image={ '/calypso/images/themes-banner/small-business.png' }
				imageTransform={ 'translateY(-19%) translateX(17%)' }
				imageAttrs={ {
					width: 410,
				} }
			/>
		);
	}
}

export default localize( SmallBusinessBanner );
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

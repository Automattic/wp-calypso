/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */

import { localize } from 'i18n-calypso';
import ThemesBanner from './index';

const SmallBusinessBanner = ( { translate } ) => (
	<ThemesBanner
		themeId="small-business"
		themeName="Small Business"
		title={ translate( 'Do you run a small business?' ) }
		description={ translate(
			'We know you’re crunched for time. We created the quick-setup {{b}}SMALL BUSINESS{{/b}} theme just for you.',
			{
				components: {
					b: <strong />,
				},
			}
		) }
		backgroundColor="#3d596d"
		image="/calypso/images/themes-banner/small-business.png"
		imageTransform="translateY(-19%) translateX(17%)"
		imageWidth={ 410 }
	/>
);

export default localize( SmallBusinessBanner );

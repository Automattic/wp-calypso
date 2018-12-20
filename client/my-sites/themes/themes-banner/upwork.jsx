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

const UpworkBanner = ( { translate } ) => (
	<ThemesBanner
		themeId="upwork"
		themeName="Upwork"
		title={ translate( 'Hire a WordPress.com Expert to Build Your Website' ) }
		description={ translate(
			"WordPres has partnered with Upwork - tap into an unlimited resource of talented professionals to help build the site you've always wanted."
		) }
		backgroundColor="#3FE6AF"
		image="/calypso/images/themes-banner/illustration-builder-referral.svg"
		imageTransform="translateY(-4.4%) translateX(17%)"
		imageWidth={ 390 }
	/>
);

export default localize( UpworkBanner );

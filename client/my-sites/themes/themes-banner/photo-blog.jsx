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

const PhotoBlogBanner = ( { translate } ) => (
	<ThemesBanner
		themeId="photo-blog"
		themeName="Photo Blog"
		title={ translate( 'Are you a photographer? An artist?' ) }
		description={ translate(
			'Explore {{b}}PHOTO BLOG{{/b}}, an elegant theme designed to showcase your visual masterpieces.',
			{
				components: {
					b: <strong />,
				},
			}
		) }
		backgroundColor="#3FE6AF"
		image="/calypso/images/themes-banner/photo-blog.png"
		imageTransform="translateY(-4.4%) translateX(17%)"
		imageWidth={ 390 }
	/>
);

export default localize( PhotoBlogBanner );

/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */

import { localize } from 'i18n-calypso';
import ThemesBanner from './index';

class PhotoBlogBanner extends PureComponent {
	render() {
		const { translate } = this.props;
		return (
			<ThemesBanner
				themeId={ 'photo-blog' }
				themeName={ 'Photo Blog' }
				title={ translate( 'Are you a photographer? An artist?' ) }
				description={ translate(
					'Explore {{b}}PHOTO BLOG{{/b}}, an elegant theme designed to showcase your visual masterpieces.',
					{
						components: {
							b: <strong />,
						},
					}
				) }
				actionLabel={ translate( 'See the theme' ) }
				backgroundColor={ '#3FE6AF' }
				image={ '/calypso/images/themes-banner/photo-blog.png' }
				imageTransform={ 'translateY(-4.4%) translateX(17%)' }
				imageAttrs={ {
					width: 390,
				} }
			/>
		);
	}
}

export default localize( PhotoBlogBanner );

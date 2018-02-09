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

class SmallBusinessBanner extends PureComponent {
	render() {
		const { translate } = this.props;
		return (
			<ThemesBanner
				themeId={ 'small-business' }
				themeName={ 'Small Business' }
				title={ translate( 'Do you run a small business?' ) }
				description={ translate(
					'We know you’re crunched for time. We created the quick-setup {{b}}SMALL BUSINESS{{/b}} theme just for you.',
					{
						components: {
							b: <strong />,
						},
					}
				) }
				actionLabel={ translate( 'See the theme' ) }
				backgroundColor={ '#3d596d' }
				image={ '/calypso/images/themes-banner/small-business.png' }
				imageTransform={ 'translateY(-19%) translateX(17%)' }
				imageAttrs={ {
					alt: translate( 'Small Business Theme' ),
					width: 410,
				} }
			/>
		);
	}
}

export default localize( SmallBusinessBanner );

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';

const NoViewsPlaceholder = ( { translate } ) => {
	return (
		<Banner
			callToAction={ translate( 'Get more traffic!' ) }
			title={ translate( 'Your post has not received any views yet!' ) }
			href="https://en.support.wordpress.com/getting-more-views-and-traffic/"
		/>
	);
};

export default localize( NoViewsPlaceholder );

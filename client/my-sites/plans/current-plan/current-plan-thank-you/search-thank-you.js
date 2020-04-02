/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ThankYou from './thank-you';

const SearchProductThankYou = ( { translate } ) => (
	<ThankYou
		illustration="/calypso/images/illustrations/thankYou.svg"
		showSearchRedirects
		title={ translate( 'Welcome to Jetpack Search!' ) }
	>
		<p>{ translate( 'We are currently indexing your site.' ) }</p>
		<p>
			{ translate(
				'In the meantime, we have configured Jetpack Search on your site — ' +
					'you should try customizing it in your traditional WordPress dashboard.'
			) }
		</p>
	</ThankYou>
);

export default localize( SearchProductThankYou );

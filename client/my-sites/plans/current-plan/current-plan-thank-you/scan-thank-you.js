/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ThankYou from './thank-you';

const ScanProductThankYou = ( { translate } ) => (
	<ThankYou
		illustration="/calypso/images/illustrations/thankYou.svg"
		showContinueButton
		title={ translate( 'Welcome to Jetpack Scan!' ) }
	>
		<p>{ translate( 'We are currently scanning your site.' ) }</p>
		<p>
			{ translate(
				'In the meantime, we have configured Jetpack Scan on your site — ' +
					'you should try customizing it in your traditional WordPress dashboard.'
			) }
		</p>
	</ThankYou>
);
export default localize( ScanProductThankYou );

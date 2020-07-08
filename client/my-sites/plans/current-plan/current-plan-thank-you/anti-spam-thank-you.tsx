/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ThankYou from './thank-you';

const AntiSpamProductThankYou = ( { translate } ) => (
	<ThankYou
		illustration="/calypso/images/illustrations/thankYou.svg"
		showScanCTAs
		title={ translate( 'Say goodbye to spam!' ) }
	>
		<p>
			{ translate(
				'Jetpack Anti-Spam is now active on your site and catching all spam. Enjoy more peace of mind and a better experience for your visitors.'
			) }
		</p>
	</ThankYou>
);
export default localize( AntiSpamProductThankYou );

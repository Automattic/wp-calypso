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
		illustration="/calypso/images/illustrations/security.svg"
		showScanCTAs
		title={ translate( 'Welcome to Jetpack Scan!' ) }
	>
		<p>{ translate( 'We just finished setting up automated malware scanning for you.' ) }</p>
		<p>
			{ translate(
				'Please add your server information to set up automated and one-click fixes. '
			) }
		</p>
		<p>{ translate( "There's also a checklist to help you get the most out of Jetpack." ) }</p>
	</ThankYou>
);
export default localize( ScanProductThankYou );

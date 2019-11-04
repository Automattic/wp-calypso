/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import ThankYou from './thank-you';

const FreePlanThankYou = ( { translate } ) => (
	<ThankYou
		illustration="/calypso/images/illustrations/security.svg"
		showCalypsoIntro
		showContinueButton
		title={ translate( 'Welcome to Jetpack Free!' ) }
	>
		<p>
			{ translate( "We've automatically begun to protect your site from attacks." ) }
			<br />
			{ translate( "You're now ready to finish the rest of the checklist." ) }
		</p>
	</ThankYou>
);

export default localize( FreePlanThankYou );

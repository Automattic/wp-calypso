/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';
import ThankYou from './thank-you';

const JetpackCompleteThankYou = ( { translate } ) => (
	<ThankYou
		illustration="/calypso/images/illustrations/security.svg"
		showCalypsoIntro
		showContinueButton
		title={ translate( 'Welcome to Jetpack Complete' ) }
	>
		<p>
			{ preventWidows(
				translate(
					"We've finished setting up anti-spam, backups & malware scanning for you. You are now ready to finish the rest of your security checklist."
				)
			) }
		</p>
	</ThankYou>
);

export default localize( JetpackCompleteThankYou );

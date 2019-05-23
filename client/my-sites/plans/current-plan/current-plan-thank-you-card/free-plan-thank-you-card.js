/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import ThankYouCard from './thank-you-card';

const FreePlanThankYouCard = ( { translate } ) => (
	<ThankYouCard
		illustration="/calypso/images/illustrations/security.svg"
		showContinueButton
		title={ translate( 'Welcome to Jetpack Free!' ) }
	>
		<p>
			{ translate( "We've automatically begun to protect your site from attacks." ) }
			<br />
			{ translate( "You're now ready to finish the rest of the checklist." ) }
		</p>
	</ThankYouCard>
);

export default localize( FreePlanThankYouCard );

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
		illustration={
			<img
				alt=""
				aria-hidden="true"
				className="current-plan-thank-you-card__illustration"
				src="/calypso/images/illustrations/security.svg"
			/>
		}
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

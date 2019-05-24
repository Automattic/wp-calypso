/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';
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
		<p>
			{ preventWidows(
				translate(
					'This is your new WordPress.com dashboard. You can manage your site ' +
						'here, or return to your self-hosted WordPress dashboard using the ' +
						'link at the bottom of your checklist.'
				)
			) }
		</p>
	</ThankYouCard>
);

export default localize( FreePlanThankYouCard );

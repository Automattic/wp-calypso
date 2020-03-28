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
		illustration="/calypso/images/illustrations/security.svg"
		showContinueButton
		title={ translate( 'Hello Jetpack Search!' ) }
	>
		<p>{ translate( 'We just finished setting up search for you.' ) }</p>
		<p>
			{ translate(
				'Next, we’ll take a look at your new WordPress.com dashboard. ' +
					'You can manage Jetpack Search under “Tools > Activity” in the sidebar. ' +
					'There’s also a checklist to help you get the most out of your Jetpack plan.'
			) }
		</p>
		<p>
			{ translate(
				'You can return to your traditional WordPress dashboard anytime by using the link at the bottom of the sidebar.'
			) }
		</p>
	</ThankYou>
);

export default localize( SearchProductThankYou );

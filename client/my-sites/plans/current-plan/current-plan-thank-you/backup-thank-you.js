/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import ThankYou from './thank-you';

const BackupProductThankYou = ( { translate } ) => (
	<ThankYou
		illustration="/calypso/images/illustrations/security.svg"
		showCalypsoIntro
		showContinueButton
		title={ translate( 'Hello backups!' ) }
	>
		<Fragment>
			<p>{ translate( 'We just finished settup up backups for you.' ) }</p>
			<p>
				{ translate( 'Next, we’ll take a look at your new WordPress.com dashboard.' ) }
				{ translate( 'You can manage your backups under “Activity” in the sidebar.' ) }
				{ translate(
					'There’s also a checklist to help you get the most out of your Jetpack plan.'
				) }
			</p>
		</Fragment>
	</ThankYou>
);

export default localize( BackupProductThankYou );

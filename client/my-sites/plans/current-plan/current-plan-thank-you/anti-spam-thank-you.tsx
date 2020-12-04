/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, ProgressBar } from '@automattic/components';
import ThankYou, { ThankYouCtaType } from './thank-you';
import getJetpackProductInstallProgress from 'calypso/state/selectors/get-jetpack-product-install-progress';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ThankYouCta: ThankYouCtaType = ( { siteAdminUrl, recordThankYouClick } ) => {
	const translate = useTranslate();
	const jetpackDashboard = siteAdminUrl + 'admin.php?page=jetpack#/dashboard';

	return (
		<Button primary href={ jetpackDashboard } onClick={ () => recordThankYouClick( 'anti-spam' ) }>
			{ translate( 'Go back to your site' ) }
		</Button>
	);
};

const AntiSpamProductThankYou = ( { installProgress } ): ReactElement => {
	const translate = useTranslate();
	const isInstalled = installProgress === 100;

	return (
		<ThankYou
			illustration="/calypso/images/illustrations/thankYou.svg"
			title={ translate( 'Say goodbye to spam!' ) }
			showHideMessage={ ! isInstalled }
			ThankYouCtaComponent={ isInstalled && ThankYouCta }
		>
			<>
				<p>{ translate( "We're setting up Jetpack Anti-spam for you right now." ) }</p>
				<p>
					{ translate(
						"In no time you'll be able to enjoy more peace of mind and provide a better experience to your visitors."
					) }
				</p>
				{ ! isInstalled && (
					<ProgressBar isPulsing total={ 100 } value={ Math.max( installProgress, 10 ) } />
				) }
			</>
		</ThankYou>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const installProgress = siteId && getJetpackProductInstallProgress( state, siteId );

	return {
		installProgress,
	};
} )( AntiSpamProductThankYou );

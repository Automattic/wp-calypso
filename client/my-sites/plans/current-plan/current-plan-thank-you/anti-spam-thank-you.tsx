import { Button, ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import getJetpackProductInstallProgress from 'calypso/state/selectors/get-jetpack-product-install-progress';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThankYou, { ThankYouCtaType } from './thank-you';

const ThankYouCta: ThankYouCtaType = ( { siteAdminUrl, recordThankYouClick } ) => {
	const translate = useTranslate();
	const jetpackDashboard = siteAdminUrl + 'admin.php?page=jetpack#/dashboard';

	return (
		<Button primary href={ jetpackDashboard } onClick={ () => recordThankYouClick( 'anti-spam' ) }>
			{ translate( 'Go back to your site' ) }
		</Button>
	);
};

const AntiSpamProductThankYou = ( { installProgress }: { installProgress: number | null } ) => {
	const translate = useTranslate();
	const isInstalled = installProgress === 100;

	return (
		<ThankYou
			illustration="/calypso/images/illustrations/thankYou.svg"
			title={ translate( 'Say goodbye to spam!' ) }
			showHideMessage={ ! isInstalled }
			ThankYouCtaComponent={ isInstalled ? ThankYouCta : undefined }
		>
			<>
				<p>{ translate( "We're setting up Jetpack Akismet Anti-spam for you right now." ) }</p>
				<p>
					{ translate(
						"In no time you'll be able to enjoy more peace of mind and provide a better experience to your visitors."
					) }
				</p>
				{ ! isInstalled && (
					<ProgressBar isPulsing total={ 100 } value={ Math.max( installProgress ?? 0, 10 ) } />
				) }
			</>
		</ThankYou>
	);
};

export default connect( ( state: IAppState ) => {
	const siteId = getSelectedSiteId( state );
	const installProgress = siteId && getJetpackProductInstallProgress( state, siteId );

	return {
		installProgress,
	};
} )( AntiSpamProductThankYou );

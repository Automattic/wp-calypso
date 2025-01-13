import { useTranslate } from 'i18n-calypso';
import JetpackAppLogo from 'calypso/assets/images/icons/jetpack-app-logo.svg';
import QrCode from 'calypso/blocks/app-promo/qr-code';
import userAgent from 'calypso/lib/user-agent';
import AppsBadge from './apps-badge';
import { AppsCard } from './apps-card';

const MobileDownloadCardTest = () => {
	const translate = useTranslate();
	const { isiPad, isiPod, isiPhone, isMobile } = userAgent;
	const isIos = isiPad || isiPod || isiPhone;

	return (
		<AppsCard
			logo={ JetpackAppLogo }
			logoName="jetpack-app-logo"
			title={ translate( 'Jetpack mobile app for WordPress' ) }
			subtitle={ translate( 'Create, design, manage, and grow your WordPress website.' ) }
		>
			{ isMobile ? (
				<div className="get-apps__badges">
					<AppsBadge
						storeName={ isIos ? 'ios' : 'android' }
						utm_source="calypso"
						utm_campaign={ isIos ? 'calypso-get-apps-button' : 'calypso-get-apps' }
					/>
				</div>
			) : (
				<div className="get-apps__badges">
					<QrCode size={ 64 } />
				</div>
			) }
		</AppsCard>
	);
};

export default MobileDownloadCardTest;

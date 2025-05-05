import { useTranslate } from 'i18n-calypso';
import JetpackAppLogo from 'calypso/assets/images/icons/jetpack-app-logo.svg';
import QrCode from 'calypso/blocks/app-promo/qr-code';
import { isIos, isAndroid } from 'calypso/lib/user-agent';
import AppsBadge from './apps-badge';
import { AppsCard } from './apps-card';

function MobileDownloadCard() {
	const translate = useTranslate();

	return (
		<AppsCard
			logo={ JetpackAppLogo }
			logoName="jetpack-app-logo"
			title={ translate( 'Jetpack mobile app for WordPress' ) }
			subtitle={ translate( 'Create, design, manage, and grow your WordPress website.' ) }
		>
			<div className="get-apps__badges">
				{ isIos() && (
					<AppsBadge storeName="ios" utm_source="calypso" utm_campaign="calypso-get-apps-button" />
				) }
				{ isAndroid() && (
					<AppsBadge storeName="android" utm_source="calypso" utm_campaign="calypso-get-apps" />
				) }
				{ ! isIos() && ! isAndroid() && <QrCode size={ 64 } /> }
			</div>
		</AppsCard>
	);
}

export default MobileDownloadCard;

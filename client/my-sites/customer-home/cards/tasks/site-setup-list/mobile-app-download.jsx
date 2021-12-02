import { translate } from 'i18n-calypso';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import userAgent from 'calypso/lib/user-agent';

const MobileAppDownload = () => {
	const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
	const isIos = isiPad || isiPod || isiPhone;
	const showIosBadge = ! isAndroid;
	const showAndroidBadge = ! isIos;

	const utm_source = 'calypso-customer-home-site-setup';

	return (
		<div className="mobile-app-download">
			<div className="mobile-app-download__text">
				<h2 className="mobile-app-download__title">{ translate( 'WordPress app' ) }</h2>
				<p className="mobile-app-download__description">
					{ translate( 'Make updates on the go.' ) }
				</p>
				{ showIosBadge && <AppsBadge storeName={ 'ios' } utm_source={ utm_source }></AppsBadge> }
				{ showAndroidBadge && (
					<AppsBadge storeName={ 'android' } utm_source={ utm_source }></AppsBadge>
				) }
			</div>
		</div>
	);
};

export default MobileAppDownload;

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { translate } from 'i18n-calypso';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import userAgent from 'calypso/lib/user-agent';

const MobileAppDownload = () => {
	const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
	const isIos = isiPad || isiPod || isiPhone;

	const showBadge = ( isIosDevice, isAndroidDevice ) => {
		const utm_source = 'calypso-customer-home-site-setup';

		if ( isIosDevice ) {
			return <AppsBadge storeName={ 'ios' } utm_source={ utm_source }></AppsBadge>;
		}
		if ( isAndroidDevice ) {
			return <AppsBadge storeName={ 'android' } utm_source={ utm_source }></AppsBadge>;
		}

		return (
			<a
				href="https://apps.wordpress.com/mobile"
				onClick={ () => {
					recordTracksEvent( 'calypso_mobile_app_download_link_click_learn_more' );
				} }
				rel="noopener noreferrer"
				className="mobile-app-download__link"
				target="_blank"
			>
				{ translate( 'Learn more' ) }
			</a>
		);
	};

	return (
		<div className="mobile-app-download">
			<div className="mobile-app-download__text">
				<h2 className="mobile-app-download__title">{ translate( 'WordPress app' ) }</h2>
				<p className="mobile-app-download__description">
					{ translate( 'Make updates on the go.' ) }
				</p>
				{ showBadge( isIos, isAndroid ) }
			</div>
		</div>
	);
};

export default MobileAppDownload;

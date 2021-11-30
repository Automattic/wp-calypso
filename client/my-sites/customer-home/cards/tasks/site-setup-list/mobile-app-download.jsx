import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import userAgent from 'calypso/lib/user-agent';

const MobileAppDownload = () => {
	const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;

	let appLink = 'https://apps.wordpress.com/mobile';
	let linkType = 'general';

	const utm_source = 'calypso-customer-home-site-setup';
	if ( isiPad || isiPod || isiPhone ) {
		appLink = `https://apps.apple.com/app/apple-store/id335703880?pt=299112&ct=${ utm_source }&mt=8`;
		linkType = 'ios';
	}

	if ( isAndroid ) {
		appLink = `https://play.google.com/store/apps/details?id=org.wordpress.android&referrer=utm_source%3D%${ utm_source }`;
		linkType = 'android';
	}

	return (
		<div className="mobile-app-download">
			<div className="mobile-app-download__app-icon">
				<Gridicon icon="my-sites" size={ 48 } />
			</div>
			<div className="mobile-app-download__text">
				<h2 className="mobile-app-download__title">{ translate( 'WordPress app' ) }</h2>
				<p className="mobile-app-download__description">
					{ translate( 'Make updates on the go.' ) }
				</p>
				<a
					className="mobile-app-download__link"
					href={ appLink }
					target="_blank"
					onClick={ () => {
						recordTracksEvent( 'calypso_mobile_app_download_link_click', {
							type_of_link: linkType,
						} );
					} }
					rel="noopener noreferrer"
				>
					{ translate( 'Download' ) }
				</a>
			</div>
		</div>
	);
};

export default MobileAppDownload;

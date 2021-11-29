import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import userAgent from 'calypso/lib/user-agent';

const MobileAppDownload = () => {
	const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;

	const appLink = 'https://apps.wordpress.com/mobile';
	let linkType = 'general';
	let showIosBadge = false;
	let showAndroidBadge = false;

	if ( isiPad || isiPod || isiPhone ) {
		showIosBadge = true;
		linkType = 'ios';
	}

	if ( isAndroid ) {
		showAndroidBadge = true;
		linkType = 'ios';
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
				{ ! showIosBadge && ! showAndroidBadge && (
					<a
						className="mobile-app-download__link"
						href={ appLink }
						target="_blank"
						onClick={ () => {
							recordTracksEvent( 'calypso_mobile_app_download_link_click', {
								type_of_link: linkType,
							} );
						} }
						rel="noreferrer"
					>
						{ translate( 'Learn more' ) }
					</a>
				) }
				{ showIosBadge && (
					<AppsBadge storeName={ 'ios' } utm_source={ 'calypso-customer-home' }></AppsBadge>
				) }
				{ showAndroidBadge && (
					<AppsBadge storeName={ 'android' } utm_source={ 'calypso-customer-home' }></AppsBadge>
				) }
			</div>
		</div>
	);
};

export default MobileAppDownload;

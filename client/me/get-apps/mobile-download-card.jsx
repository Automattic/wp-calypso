/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const MobileDownloadCard = () => {
	const trackIosClick = () => recordTracksEvent( 'calypso_app_download_ios_click' );
	const trackAndroidClick = () => recordTracksEvent( 'calypso_app_download_android_click' );
	return (
		<Card className="get-apps__mobile">
			<div className="get-apps__card-text">
				<h3 className="get-apps__card-title">{ translate( 'Mobile Apps' ) }</h3>
				<p className="get-apps__description">{ translate( 'WordPress at your fingertips.' ) }</p>
			</div>
			<div className="get-apps__badges">
				<a href={ 'https://itunes.apple.com/us/app/wordpress/id335703880?mt=8' } onClick={ trackIosClick }>
					<img src={ '/calypso/images/me/get-apps-app-store.png' }
						title={ translate( 'Download the WordPress iOS mobile app.' ) }
						alt={ translate( 'Apple App Store download badge' ) } />
				</a>
				<a href={ 'https://play.google.com/store/apps/details?id=org.wordpress.android' } onClick={ trackAndroidClick }>
					<img src={ '/calypso/images/me/get-apps-google-play.png' }
						title={ translate( 'Download the WordPress Android mobile app.' ) }
						alt={ translate( 'Google Play Store download badge' ) } />
				</a>
			</div>
		</Card>
	);
};

export default MobileDownloadCard;

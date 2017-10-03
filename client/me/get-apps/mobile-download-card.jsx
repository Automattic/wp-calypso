/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';

const MobileDownloadCard = ( { translate, trackIosClick, trackAndroidClick } ) => {
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

MobileDownloadCard.propTypes = {
	translate: PropTypes.func,
	trackIosClick: PropTypes.func,
	trackAndroidClick: PropTypes.func,
};

MobileDownloadCard.defaultProps = {
	translate: identity,
	trackIosClick: noop,
	trackAndroidClick: noop,
};

const mapDispatchToProps = {
	trackIosClick: () => recordTracksEvent( 'calypso_app_download_ios_click' ),
	trackAndroidClick: () => recordTracksEvent( 'calypso_app_download_android_click' ),
};

export default connect(
	null,
	mapDispatchToProps
)( localize( MobileDownloadCard ) );

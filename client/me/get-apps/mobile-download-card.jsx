/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import AppsBadge from 'me/get-apps/apps-badge';

const MobileDownloadCard = ( { translate } ) => {
	return (
		<Card className="get-apps__mobile">
			<div className="get-apps__card-text">
				<h3 className="get-apps__card-title">{ translate( 'Mobile Apps' ) }</h3>
				<p className="get-apps__description">{ translate( 'WordPress at your fingertips.' ) }</p>
			</div>
			<div className="get-apps__badges">
				<AppsBadge
					storeLink="https://play.google.com/store/apps/details?id=org.wordpress.android&referrer=utm_source%3Dcalypso-get-apps%26utm_medium%3Dweb%26utm_campaign%3Dmobile-download-promo-pages"
					storeName={ 'android' }
					titleText={ translate( 'Download the WordPress Android mobile app.' ) }
					altText={ translate( 'Google Play Store download badge' ) }
				/>
				<AppsBadge
					storeLink="https://itunes.apple.com/app/apple-store/id335703880?pt=299112&ct=calpyso-get-apps-button&mt=8"
					storeName={ 'ios' }
					titleText={ translate( 'Download the WordPress iOS mobile app.' ) }
					altText={ translate( 'Apple App Store download badge' ) }
				/>
			</div>
		</Card>
	);
};

MobileDownloadCard.propTypes = {
	translate: PropTypes.func,
};

MobileDownloadCard.defaultProps = {
	translate: identity,
};

export default localize( MobileDownloadCard );

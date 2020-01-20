/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AppsBadge from 'blocks/get-apps/apps-badge';
import userAgent from 'lib/user-agent';
import { isDesktop } from 'lib/viewport';
import CardHeading from 'components/card-heading';
import appleStoreLogo from 'assets/images/customer-home/apple-store.png';
import googlePlayLogo from 'assets/images/customer-home/google-play.png';

/**
 * Style dependencies
 */
import './style.scss';

export const GoMobileCard = ( { translate } ) => {
	const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
	const isIos = isiPad || isiPod || isiPhone;
	const showIosBadge = isDesktop() || isIos || ! isAndroid;
	const showAndroidBadge = isDesktop() || isAndroid || ! isIos;
	const showOnlyOneBadge = showIosBadge !== showAndroidBadge;

	return (
		<Card
			className={ classnames( 'go-mobile-card', {
				'is-single-store': showOnlyOneBadge,
			} ) }
		>
			<div>
				<CardHeading>{ translate( 'Go Mobile' ) }</CardHeading>
				<h6 className="go-mobile-card__subheader">{ translate( 'Make updates on the go' ) }</h6>
			</div>
			<div className="go-mobile-card__app-badges">
				{ showIosBadge && (
					<AppsBadge
						storeLink="https://apps.apple.com/app/apple-store/id335703880?pt=299112&ct=calypso-customer-home&mt=8"
						storeName={ 'ios' }
						titleText={ translate( 'Download the WordPress iOS mobile app.' ) }
						altText={ translate( 'Apple App Store download badge' ) }
					>
						<img src={ appleStoreLogo } alt="" />
					</AppsBadge>
				) }
				{ showAndroidBadge && (
					<AppsBadge
						storeLink="https://play.google.com/store/apps/details?id=org.wordpress.android&referrer=utm_source%3Dcalypso-customer-home%26utm_medium%3Dweb%26utm_campaign%3Dmobile-download-promo-pages"
						storeName={ 'android' }
						titleText={ translate( 'Download the WordPress Android mobile app.' ) }
						altText={ translate( 'Google Play Store download badge' ) }
					>
						<img src={ googlePlayLogo } alt="" />
					</AppsBadge>
				) }
			</div>
		</Card>
	);
};

export default localize( GoMobileCard );

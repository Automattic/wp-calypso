/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userAgent from 'lib/user-agent';
import Task from '../task';
import AppsBadge from 'blocks/get-apps/apps-badge';

/**
 * Image dependencies
 */
import appleStoreLogo from 'assets/images/customer-home/apple-store.png';
import googlePlayLogo from 'assets/images/customer-home/google-play.png';

const GoMobile = () => {
	const translate = useTranslate();
	const { isAndroid } = userAgent;

	const actionButton = isAndroid ? (
		<AppsBadge
			storeLink="https://play.google.com/store/apps/details?id=org.wordpress.android&referrer=utm_source%3Dcalypso-customer-home%26utm_medium%3Dweb%26utm_campaign%3Dmobile-download-promo-pages"
			storeName={ 'android' }
			titleText={ translate( 'Download the WordPress Android mobile app.' ) }
			altText={ translate( 'Google Play Store download badge' ) }
		>
			<img src={ googlePlayLogo } alt="" />
		</AppsBadge>
	) : (
		<AppsBadge
			storeLink="https://apps.apple.com/app/apple-store/id335703880?pt=299112&ct=calypso-customer-home&mt=8"
			storeName={ 'ios' }
			titleText={ translate( 'Download the WordPress iOS mobile app.' ) }
			altText={ translate( 'Apple App Store download badge' ) }
		>
			<img src={ appleStoreLogo } alt="" />
		</AppsBadge>
	);

	return (
		<Task
			title={ translate( 'Update and manage on the go' ) }
			description={ translate(
				'Inspiration strikes any time, anywhere. Post, read, check stats, and more with the Wordpress app at your fingertips.'
			) }
			actionButton={ actionButton }
			timing={ 2 }
			taskId="go-mobile"
		/>
	);
};
export default GoMobile;

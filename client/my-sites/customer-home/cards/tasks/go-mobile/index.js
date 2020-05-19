/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Task from 'my-sites/customer-home/cards/tasks/task';
import { preventWidows } from 'lib/formatting';
import AppsBadge from 'blocks/get-apps/apps-badge';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { TASK_GO_MOBILE_ANDROID, TASK_GO_MOBILE_IOS } from 'my-sites/customer-home/cards/constants';

/**
 * Image dependencies
 */
import appleStoreLogo from 'assets/images/customer-home/apple-store.png';
import googlePlayLogo from 'assets/images/customer-home/google-play.png';

const GoMobile = ( { isIos } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordStats = ( platform ) => {
		const eventName =
			platform === 'ios'
				? 'calypso_customer_home_mobile_ios_download_click'
				: 'calypso_customer_home_mobile_android_download_click';
		const bumpName =
			platform === 'ios' ? 'mobile_ios_download_click' : 'mobile_android_download_click';
		dispatch(
			composeAnalytics(
				recordTracksEvent( eventName, {} ),
				bumpStat( 'calypso_customer_home', bumpName )
			)
		);
	};

	const actionButton = isIos ? (
		<AppsBadge
			storeLink="https://apps.apple.com/app/apple-store/id335703880?pt=299112&ct=calypso-customer-home&mt=8"
			storeName={ 'ios' }
			titleText={ translate( 'Download the WordPress iOS mobile app.' ) }
			altText={ translate( 'Apple App Store download badge' ) }
			onClick={ recordStats( 'ios' ) }
		>
			<img src={ appleStoreLogo } alt="" />
		</AppsBadge>
	) : (
		<AppsBadge
			storeLink="https://play.google.com/store/apps/details?id=org.wordpress.android&referrer=utm_source%3Dcalypso-customer-home%26utm_medium%3Dweb%26utm_campaign%3Dmobile-download-promo-pages"
			storeName={ 'android' }
			titleText={ translate( 'Download the WordPress Android mobile app.' ) }
			altText={ translate( 'Google Play Store download badge' ) }
			onClick={ recordStats( 'android' ) }
		>
			<img src={ googlePlayLogo } alt="" />
		</AppsBadge>
	);

	return (
		<Task
			title={ preventWidows( translate( 'Update and manage on the go' ) ) }
			description={ preventWidows(
				translate(
					'Inspiration strikes any time, anywhere. Post, read, check stats, and more with the WordPress app at your fingertips.'
				)
			) }
			actionButton={ actionButton }
			timing={ 2 }
			taskId={ isIos ? TASK_GO_MOBILE_IOS : TASK_GO_MOBILE_ANDROID }
		/>
	);
};

GoMobile.propTypes = {
	isIos: PropTypes.bool,
};

export default GoMobile;

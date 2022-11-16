import { loadScript } from '@automattic/load-script';
import { sprintf, __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { debug, A8C_ANALYTICS_CACHE_VERSION } from 'calypso/lib/analytics/ad-tracking/constants';
import { loadTrackingScripts } from 'calypso/lib/analytics/ad-tracking/load-tracking-scripts';

type A8CAnalyticsConfig = {
	cookieBanner: unknown; // TODO: Import typing from a8c-analytics.js
};

declare global {
	interface Window {
		a8cAnalyticsConfig: A8CAnalyticsConfig;
	}
}

const a8cAnalyticsConfig: A8CAnalyticsConfig = {
	cookieBanner: {
		version: '2',
		cssZIndex: 50001,
		skipBanner: false,
		cookieDomain: null,
		v1CookieName: 'sensitive_pixel_option',
		v2CookieName: 'sensitive_pixel_options',
		v1Text: 'Our websites and dashboards use cookies.',
		v2Text: __(
			'We and our partners process your personal data (such as browsing data, IP addresses, cookie information, and other unique identifiers) based on your consent and/or our legitimate interest to optimize our website, marketing activities, and your user experience.'
		),
		v2OptionsText: sprintf(
			// translators: %s is a URL like <https://automattic.com/privacy/> or <https://automattic.com/cookies/>
			__(
				'Your privacy is critically important to us. We and our partners use, store, and process your personal data to optimize: our <strong>website</strong> such as by improving security or conducting analytics, <strong>marketing activities</strong> to help deliver relevant marketing or content, and your <strong>user experience</strong> such as by remembering your account name, language settings, or cart information, where applicable. You can customize your cookie settings below. Learn more in our <a href="%1$s" target="_blank">Privacy Policy</a> and <a href="%2$s" target="_blank">Cookie Policy</a>.'
			),
			'https://automattic.com/privacy/',
			'https://automattic.com/cookies/'
		),
		v2EssentialOptionHeading: __( 'Required' ),
		v2EssentialOptionText: __(
			'These cookies are essential for our websites and services to perform basic functions and are necessary for us to operate certain features. These include those required to allow registered users to authenticate and perform account-related functions, store preferences set by users such as account name, language, and location, and ensure our services are operating properly.'
		),
		v2AnalyticsOptionHeading: __( 'Analytics' ),
		v2AnalyticsOptionText: sprintf(
			// translators: %s is a URL like <https://automattic.com/cookies/>
			__(
				'These cookies allow us to optimize performance by collecting information on how users interact with our websites, including which pages are visited most, as well as other analytical data. We use these details to improve how our websites function and to understand how users interact with them. To learn more about how to control your cookie preferences, go to <a target="_blank" href="%1$s">%1$s</a>.'
			),
			'https://automattic.com/cookies/'
		),
		v2AdvertisingOptionHeading: __( 'Advertising' ),
		v2AdvertisingOptionText: __(
			'These cookies are set by us and our advertising partners to provide you with relevant content and to understand that content’s effectiveness. They may be used to collect information about your online activities over time and across different websites to predict your preferences and to display more relevant advertisements to you. These cookies also allow a profile to be built about you and your interests, and enable personalized ads to be shown to you based on your profile.'
		),
		v1ButtonText: __( 'Got It!' ),
		v2CustomizeButtonText: __( 'Customize' ),
		v2AcceptAllButtonText: __( 'Accept All' ),
		v2AcceptSelectionButtonText: __( 'Accept Selection' ),
	},
};

const onA8cAnalyticsLoaded = () => {
	debug( '[ a8c-analytics.js ] Script has been loaded, Cookie Banner may be displayed' );
};
const onA8cTrackersFired = () => {
	debug( '[ a8c-analytics.js ] Triggering allowed trackers in regard to user consent' );
	loadTrackingScripts();
};

/**
 * Component that loads a8c-analytics.js scripts into the React app functionality.
 * That includes:
 * - Cookie Banner
 * - Do Not Sell dialog
 *
 * The script automatically identifies if user should see the banner, for reference see:
 * https://opengrok.a8c.com/source/xref/wpcom/wp-content/mu-plugins/a8c-analytics/a8c-analytics.js?r=25b9de55
 */
const QueryAnalyticsBanners = () => {
	useEffect(
		() => {
			// Assign config that will be used by a8c-analytics.js script
			window.a8cAnalyticsConfig = a8cAnalyticsConfig;
			// Add listener that will get triggered once a8c-analytics.js will be successfully loaded
			document.addEventListener( 'a8c-analytics:loaded', onA8cAnalyticsLoaded );
			document.addEventListener( 'a8c-analytics:fire-sensitive-pixels', onA8cTrackersFired );
			// Load the script into the html document
			loadScript(
				`//s1.wp.com/wp-content/mu-plugins/a8c-analytics/a8c-analytics.js?v=${ A8C_ANALYTICS_CACHE_VERSION }`,
				( error?: string ) => {
					if ( error ) {
						debug(
							"[ a8c-analytics.js ] Couldn't load the script! Aborting displaying Cookie Banner"
						);
					}
				}
			);

			return () => {
				document.removeEventListener( 'a8c-analytics:loaded', onA8cAnalyticsLoaded );
				document.removeEventListener( 'a8c-analytics:fire-sensitive-pixels', onA8cTrackersFired );
			};
		},
		[
			/* No dependencies, ensure that it run only once */
		]
	);

	return null; // This is a query component, loading scripts as side effect
};

export default QueryAnalyticsBanners;

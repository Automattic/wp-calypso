import config from '@automattic/calypso-config';
import debugFactory from 'debug';

/**
 * Module variables
 */
export const debug = debugFactory( 'calypso:analytics:ad-tracking' );

export const FACEBOOK_TRACKING_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';
export const GOOGLE_GTAG_SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js?id=';
export const GOOGLE_GTM_SCRIPT_URL = 'https://www.googletagmanager.com/gtm.js?id=';
export const BING_TRACKING_SCRIPT_URL = 'https://bat.bing.com/bat.js';
export const CRITEO_TRACKING_SCRIPT_URL = 'https://static.criteo.net/js/ld/ld.js';
export const YAHOO_GEMINI_CONVERSION_PIXEL_URL =
	'https://sp.analytics.yahoo.com/spp.pl?a=10000&.yp=10014088&ec=wordpresspurchase';
export const YAHOO_GEMINI_AUDIENCE_BUILDING_PIXEL_URL =
	'https://sp.analytics.yahoo.com/spp.pl?a=10000&.yp=10014088';
export const PANDORA_CONVERSION_PIXEL_URL =
	'https://data.adxcel-ec2.com/pixel/?ad_log=referer&action=purchase&pixid=7efc5994-458b-494f-94b3-31862eee9e26';
export const EXPERIAN_CONVERSION_PIXEL_URL =
	'https://d.turn.com/r/dd/id/L21rdC84MTYvY2lkLzE3NDc0MzIzNDgvdC8yL2NhdC8zMjE4NzUwOQ';
export const ICON_MEDIA_RETARGETING_PIXEL_URL =
	'https://tags.w55c.net/rs?id=cab35a3a79dc4173b8ce2c47adad2cea&t=marketing';
export const ICON_MEDIA_SIGNUP_PIXEL_URL =
	'https://tags.w55c.net/rs?id=d239e9cb6d164f7299d2dbf7298f930a&t=marketing';
export const ICON_MEDIA_ORDER_PIXEL_URL =
	'https://tags.w55c.net/rs?id=d299eef42f2d4135a96d0d40ace66f3a&t=checkout';
export const ADROLL_PAGEVIEW_PIXEL_URL_1 =
	'https://d.adroll.com/ipixel/PEJHFPIHPJC2PD3IMTCWTT/WV6A5O5PBJBIBDYGZHVBM5?name=ded132f8';
export const ADROLL_PAGEVIEW_PIXEL_URL_2 =
	'https://d.adroll.com/fb/ipixel/PEJHFPIHPJC2PD3IMTCWTT/WV6A5O5PBJBIBDYGZHVBM5?name=ded132f8';
export const ADROLL_PURCHASE_PIXEL_URL_1 =
	'https://d.adroll.com/ipixel/PEJHFPIHPJC2PD3IMTCWTT/WV6A5O5PBJBIBDYGZHVBM5?name=8eb337b5';
export const ADROLL_PURCHASE_PIXEL_URL_2 =
	'https://d.adroll.com/fb/ipixel/PEJHFPIHPJC2PD3IMTCWTT/WV6A5O5PBJBIBDYGZHVBM5?name=8eb337b5';
export const TWITTER_TRACKING_SCRIPT_URL = 'https://static.ads-twitter.com/uwt.js';
export const LINKED_IN_SCRIPT_URL = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
export const QUORA_SCRIPT_URL = 'https://a.quora.com/qevents.js';
export const OUTBRAIN_SCRIPT_URL = 'https://amplify.outbrain.com/cp/obtp.js';
export const PINTEREST_SCRIPT_URL = 'https://s.pinimg.com/ct/core.js';
export const TRACKING_IDS = {
	bingInit: '4074038',
	criteo: '31321',
	dcmFloodlightAdvertiserId: '6355556',
	facebookInit: '823166884443641',
	facebookJetpackInit: '919484458159593',
	facebookAkismetInit: '485349158311379',
	fullStory: '120RG4',
	fullStoryJetpack: '181XXV',
	outbrainAdvId: '00f0f5287433c2851cc0cb917c7ff0465e',
	pinterestInit: '2613194105266',
	quantcast: 'p-3Ma3jHaQMB_bS',
	quoraPixelId: '420845cb70e444938cf0728887a74ca1',
	twitterPixelId: 'nvzbs',
	wpcomGoogleAnalyticsGtag: config( 'google_analytics_key' ), // google_analytics_key is only used in wpcom env
	wpcomFloodlightGtag: 'DC-6355556',
	wpcomGoogleAdsGtag: 'AW-946162814',
	wpcomGoogleAdsGtagSignupStart: 'AW-946162814/baDICKzQiq4BEP6YlcMD', // "WordPress.com Signup Start"
	wpcomGoogleAdsGtagRegistration: 'AW-946162814/_6cKCK6miZYBEP6YlcMD', // "WordPress.com Registration"
	wpcomGoogleAdsGtagSignup: 'AW-946162814/5-NnCKy3xZQBEP6YlcMD', // "All Calypso Signups (WordPress.com)"
	wpcomGoogleAdsGtagAddToCart: 'AW-946162814/MF4yCNi_kZYBEP6YlcMD', // "WordPress.com AddToCart"
	wpcomGoogleAdsGtagPurchase: 'AW-946162814/taG8CPW8spQBEP6YlcMD', // "WordPress.com Purchase Gtag"
	wpcomGoogleGA4Gtag: 'G-1H4VG5F5JF',
	jetpackGoogleAnalyticsGtag: 'UA-52447-43', // Jetpack Gtag (Analytics) for use in Jetpack x WordPress.com Flows
	jetpackGoogleGA4Gtag: 'G-YELRMVV4YG',
	jetpackGoogleAdsGtagPurchase: 'AW-946162814/kIF1CL3ApfsBEP6YlcMD',
	akismetGoogleGA4Gtag: 'G-V8X5PZE9F8',
	akismetGoogleAnalyticsGtag: 'UA-19309600-2', // Akismet Gtag (Analytics) for use in Akismet x WordPress.com Flows
	akismetGoogleAdsGtagPurchase: 'AW-10778599042/U-01CImL14MDEIK90ZMo', // "Akismet.com Purchase Gtag"
	jetpackLinkedinId: '4537722',
	jetpackTwitterPixelId: 'odlje',
	wooGoogleTagManagerId: 'GTM-W64W8Q',
};
// This name is something we created to store a session id for DCM Floodlight session tracking
export const DCM_FLOODLIGHT_SESSION_COOKIE_NAME = 'dcmsid';
export const DCM_FLOODLIGHT_SESSION_LENGTH_IN_SECONDS = 1800;

export const GA_PRODUCT_BRAND_WPCOM = 'WordPress.com';
export const GA_PRODUCT_BRAND_JETPACK = 'Jetpack';

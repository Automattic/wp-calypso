import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { getQueryArgs } from 'calypso/lib/query-args';

type UserInfo = {
	siteUrl: string;
	siteId: number;
	localDateTime: string;
	screenSize: {
		width: number;
		height: number;
	};
	browserSize: {
		width: number;
		height: number;
	};
	userAgent: string;
	geoLocation: {
		country_short: string;
		country_long: string;
		region: string;
		city: string;
	};
	cameThrough: string | null;
};

/**
 * Returns the source where the user came from.
 */
function getUserCameThrough() {
	const queryArgs = getQueryArgs();
	const isWCCOM = queryArgs?.ref === 'woocommerce-com';

	if ( isWCCOM ) {
		return isWcMobileApp() ? 'Store setup on Woo mobile app' : 'Store setup on Woo browser';
	}
	return null;
}

export function getUserInfo(
	message: string,
	siteUrl: string,
	siteId: number,
	geoLocation: UserInfo[ 'geoLocation' ]
) {
	const info: UserInfo = {
		siteId,
		siteUrl,
		localDateTime: `${ new Date().toLocaleDateString() } ${ new Date().toLocaleTimeString() }`,
		// add screen size
		screenSize: {
			width: window.screen.width,
			height: window.screen.height,
		},
		// add browser size
		browserSize: {
			width: window.innerWidth,
			height: window.innerHeight,
		},
		// add user agent
		userAgent: window.navigator.userAgent,
		geoLocation,
		cameThrough: getUserCameThrough(),
	};
	return info;
}

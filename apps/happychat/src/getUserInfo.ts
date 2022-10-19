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
};

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
	};
	return info;
}

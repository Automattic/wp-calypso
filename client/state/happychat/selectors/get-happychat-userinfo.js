/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import getGeoLocation from 'state/happychat/selectors/get-geolocation';

export default ( state ) => ( { site, howCanWeHelp, howYouFeel } ) => {
	const info = {
		howCanWeHelp,
		howYouFeel,
		siteId: site.ID,
		siteUrl: site.URL,
		localDateTime: moment().format( 'h:mm a, MMMM Do YYYY' ),
	};

	if ( typeof window !== 'undefined' ) {
		// add screen size
		info.screenSize = {
			width: window.screen.width,
			height: window.screen.height,
		};

		// add browser size
		info.browserSize = {
			width: window.innerWidth,
			height: window.innerHeight,
		};

		// add user agent
		info.userAgent = window.navigator.userAgent;
	}

	const geoLocation = getGeoLocation( state );
	if ( geoLocation ) {
		info.geoLocation = geoLocation;
	}

	return info;
};

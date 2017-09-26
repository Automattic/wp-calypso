/**
 * External dependencies
 */
import moment from 'moment';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	getGeoLocation,
} from 'extensions/happychat/state/selectors';

const debug = debugFactory( 'calypso:extensions:happychat:state:data-layer:send-info' );

const sendInfo = ( connection ) => ( { getState }, { howCanWeHelp, howYouFeel, site } ) => {
	const info = {
		howCanWeHelp,
		howYouFeel,
		siteId: site.ID,
		siteUrl: site.URL,
		localDateTime: moment().format( 'h:mm a, MMMM Do YYYY' ),
	};

	// add screen size
	if ( 'object' === typeof ( screen ) ) {
		info.screenSize = {
			width: screen.width,
			height: screen.height
		};
	}

	// add browser size
	if ( 'object' === typeof ( window ) ) {
		info.browserSize = {
			width: window.innerWidth,
			height: window.innerHeight
		};
	}

	// add user agent
	if ( 'object' === typeof ( navigator ) ) {
		info.userAgent = navigator.userAgent;
	}

	//  add geo location
	const state = getState();
	const geoLocation = getGeoLocation( state );
	if ( geoLocation ) {
		info.geoLocation = geoLocation;
	}

	debug( 'sending info message', info );
	connection.sendInfo( info );
};

export default sendInfo;

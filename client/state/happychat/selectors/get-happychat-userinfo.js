/** @format */
/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import getGeoLocation from 'state/happychat/selectors/get-geolocation';
import getCurrentUserRegisterDate from 'state/selectors/get-current-user-register-date';
import { getLastIncompleteSignupStep } from 'state/signup/progress/selectors';
import { getcurrentFlowName } from 'state/signup/flow/selectors';

export default state => ( { site, howCanWeHelp, howYouFeel } ) => {
	const info = {
		howCanWeHelp,
		howYouFeel,
		siteId: site.ID,
		siteUrl: site.URL,
		userRegistered: moment( getCurrentUserRegisterDate( state ) ).fromNow(),
		localDateTime: moment().format( 'h:mm a, MMMM Do YYYY' ),
	};

	// add screen size
	if ( 'object' === typeof screen ) {
		info.screenSize = {
			width: screen.width,
			height: screen.height,
		};
	}

	// add browser size
	if ( 'object' === typeof window ) {
		info.browserSize = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
	}

	// add user agent
	if ( 'object' === typeof navigator ) {
		info.userAgent = navigator.userAgent;
	}

	const geoLocation = getGeoLocation( state );
	if ( geoLocation ) {
		info.geoLocation = geoLocation;
	}

	// Add the signup flow name
	const lastSignupFlow = getcurrentFlowName( state );
	if ( lastSignupFlow ) {
		info.lastSignupFlow = lastSignupFlow;
	}

	// Add last incomplete signup step if any
	const lastIncompleteSignupStep = getLastIncompleteSignupStep( state );
	if ( lastIncompleteSignupStep ) {
		info.lastIncompleteSignupStep = lastIncompleteSignupStep.stepName;
		info.lastSignupProgress = moment( lastIncompleteSignupStep.lastUpdated ).fromNow();
	}

	return info;
};

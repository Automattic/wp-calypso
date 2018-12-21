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
import { getCurrentFlowName, getCurrentStepName } from 'state/signup/flow/selectors';
import { getSectionName } from 'state/ui/selectors';

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

	// Add signup info if the user is currently in signup
	const isUserInSignUp = 'signup' === getSectionName( state );
	if ( isUserInSignUp ) {
		const lastIncompleteSignupStep = getLastIncompleteSignupStep( state );
		info.currentSignupStatus = {
			flowName: getCurrentFlowName( state ) || 'unknown',
			currentStep: getCurrentStepName( state ) || 'unknown',
			lastIncompleteStep: lastIncompleteSignupStep.stepName || 'unknown',
		};
	}

	return info;
};

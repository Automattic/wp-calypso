import { getCurrentUser, recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isMobile } from '@automattic/viewport';
import debug from 'debug';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
const survicateDebug = debug( 'calypso:analytics:survicate' );

let survicateScriptLoaded = false;
const workspaceId = 'e4794374cce15378101b63de24117572';

/**
 * Sets Survicate visitor traits with current user data
 */
const setSurvicateVisitorTraits = () => {
	const user = getCurrentUser();

	if ( isUserOnAnonymousPaths() ) {
		survicateDebug( 'Not setting Survicate visitor traits because user is on an anonymous path' );
		return;
	}

	if ( ! user || ! user.email ) {
		survicateDebug( 'Not setting Survicate visitor traits because user is not logged in' );

		// Log error to backend for monitoring
		recordTracksEvent( 'calypso_survicate_user_not_available_error', {
			user_exists: !! user,
			user_has_email: !! ( user && user.email ),
			referrer: document.referrer || '',
			pathname: window.location.pathname || '',
			hostname: window.location.hostname || '',
		} );

		return;
	}

	// eslint-disable-next-line no-undef
	if ( typeof _sva !== 'undefined' && _sva.setVisitorTraits ) {
		// eslint-disable-next-line no-undef
		_sva.setVisitorTraits( {
			email: user.email,
		} );
		survicateDebug( 'Survicate visitor traits set with email: ' + user.email );
	} else {
		survicateDebug( 'Survicate _sva object not available' );
	}
};

export function mayWeLoadSurvicateScript() {
	return config( 'survicate_enabled' );
}

/**
 * Checks if the user is on an anonymous path.
 * @returns {boolean} True if the user is on an anonymous path, false otherwise
 */
export function isUserOnAnonymousPaths() {
	const pathname = window.location.pathname;
	const anonymousPaths = [
		'/log-in',
		'/setup/onboarding/user',
		'/log-in/lostpassword',
		'/account/user-social',
		'/log-in/link',
		'/log-in/qr',
	];

	return anonymousPaths.some(
		( path ) => pathname === path || pathname.startsWith( `${ path }/` )
	);
}

export function addSurvicate() {
	// Only add survicate for en languages
	if ( ! getLocaleSlug().startsWith( 'en' ) ) {
		survicateDebug( 'Not loading Survicate script for non-en language' );
		return;
	}

	if ( isMobile() ) {
		survicateDebug( 'Not loading Survicate script on mobile device' );
		return;
	}

	if ( survicateScriptLoaded ) {
		setTimeout( setSurvicateVisitorTraits, 1000 );
		survicateDebug( 'Survicate script already loaded' );
		return;
	}

	if ( ! mayWeLoadSurvicateScript() ) {
		survicateDebug( 'Not loading Survicate script due to config setting' );
		return;
	}

	( function () {
		const s = document.createElement( 'script' );
		s.src = `https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`;
		s.async = true;

		// Wait for the script to load before setting visitor traits
		s.onload = function () {
			survicateDebug( 'Survicate script loaded' );
			setTimeout( setSurvicateVisitorTraits, 1000 );
		};

		s.onerror = function () {
			survicateDebug( 'Failed to load Survicate script' );
		};

		const e = document.getElementsByTagName( 'script' )[ 0 ];
		e.parentNode.insertBefore( s, e );
	} )();

	survicateScriptLoaded = true;
}

/**
 * Triggers the Help Center feedback survey and ensures the Survicate overlay
 * closes when the user clicks outside the modal.
 * This is needed as the Survicate overlay click doesn't close correctly.
 * See: https://a8c.slack.com/archives/C04H4NY6STW/p1766088738895199?thread_ts=1765290523.386849&cid=C04H4NY6STW
 */
export function showHelpCenterFeedbackSurvey() {
	const survicate = window._sva;

	if ( ! survicate?.invokeEvent ) {
		return;
	}

	const handleSurveyDisplayed = () => {
		const overlay = document.querySelector( '#survicate-box .sv__overlay' );

		if ( ! overlay ) {
			return;
		}

		const handleOverlayClick = () => {
			survicate.destroyVisitor?.();
		};

		overlay.addEventListener( 'click', handleOverlayClick, { once: true } );
		survicate.removeEventListener?.( 'survey_displayed', handleSurveyDisplayed );
	};

	survicate.addEventListener?.( 'survey_displayed', handleSurveyDisplayed );
	survicate.invokeEvent( 'showFeedbackSurveyFromHelpCenter' );
}

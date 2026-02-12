import { getCurrentUser, recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	isSurvicateScriptLoaded,
	setSurvicateVisitorTraits,
	getSurvicateApi,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';
import debug from 'debug';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
const survicateDebug = debug( 'calypso:analytics:survicate' );

/**
 * Sets Survicate visitor traits with current user data.
 * Calypso-specific: uses getCurrentUser() and checks anonymous paths.
 */
const setCalypsoVisitorTraits = () => {
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

	setSurvicateVisitorTraits( { email: user.email } );
	survicateDebug( 'Survicate visitor traits set with email: ' + user.email );
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
	if (
		! shouldLoadSurvicate( {
			locale: getLocaleSlug(),
			isMobile: !! isMobile(),
		} )
	) {
		survicateDebug( 'Not loading Survicate script: conditions not met' );
		return;
	}

	if ( isSurvicateScriptLoaded() ) {
		setCalypsoVisitorTraits();
		survicateDebug( 'Survicate script already loaded' );
		return;
	}

	if ( ! mayWeLoadSurvicateScript() ) {
		survicateDebug( 'Not loading Survicate script due to config setting' );
		return;
	}

	loadSurvicateScript( SURVICATE_WORKSPACE_ID )
		.then( () => {
			survicateDebug( 'Survicate script loaded' );
			setCalypsoVisitorTraits();
		} )
		.catch( () => {
			survicateDebug( 'Failed to load Survicate script' );
		} );
}

/**
 * Triggers the Help Center feedback survey and ensures the Survicate overlay
 * closes when the user clicks outside the modal.
 * This is needed as the Survicate overlay click doesn't close correctly.
 * See: https://a8c.slack.com/archives/C04H4NY6STW/p1766088738895199?thread_ts=1765290523.386849&cid=C04H4NY6STW
 */
export function showHelpCenterFeedbackSurvey() {
	const api = getSurvicateApi();

	if ( ! api ) {
		return;
	}

	const handleSurveyDisplayed = () => {
		const overlay = document.querySelector( '#survicate-box .sv__overlay' );

		if ( ! overlay ) {
			return;
		}

		const handleOverlayClick = () => {
			api.destroyVisitor();
		};

		overlay.addEventListener( 'click', handleOverlayClick, { once: true } );
		api.removeEventListener( 'survey_displayed', handleSurveyDisplayed );
	};

	api.addEventListener( 'survey_displayed', handleSurveyDisplayed );
	api.invokeEvent( 'showFeedbackSurveyFromHelpCenter' );
}

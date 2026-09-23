import {
	loadSurvicateScript,
	setSurvicateVisitorTraits,
	shouldLoadSurvicate,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';

// Matches the Multi-site Dashboard's `useViewportMatch( 'mobile', '<' )`, which
// resolves to `(max-width: 480px)`, so both surfaces agree on "mobile".
const MOBILE_BREAKPOINT = 480;

function init() {
	// Emitted by class-survicate.php (jetpack-mu-wpcom) as a `before` inline
	// script; PHP has already decided the user, screen and site are eligible.
	const config = window.wpcomSurvicateConfig;
	if ( ! config ) {
		return;
	}

	const { locale = '', traits = {} } = config;

	if ( ! shouldLoadSurvicate( { locale, isMobile: window.innerWidth <= MOBILE_BREAKPOINT } ) ) {
		return;
	}

	loadSurvicateScript( SURVICATE_WORKSPACE_ID )
		.then( () => {
			setSurvicateVisitorTraits( traits );
		} )
		.catch( () => {
			// Surveys are optional; a blocked or failed SDK load is not an error.
		} );
}

init();

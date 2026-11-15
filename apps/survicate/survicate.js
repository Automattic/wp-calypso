import {
	loadSurvicateScript,
	registerSurveySuppressor,
	setSurvicateVisitorTraits,
	shouldLoadSurvicate,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';

/**
 * Suppresses surveys while the admin bar notifications panel is open.
 *
 * wpcom's notes script (`mu-plugins/notes/admin-bar-v2.js`, also loaded on
 * Atomic by Jetpack's notes module) opens the panel by toggling `wpnt-show` on
 * `#wp-admin-bar-notes`. It emits no event and mounts no modal, so neither the
 * package's modal observer nor the Help Center store sees it.
 */
function registerNotificationsSuppressor() {
	const notesMenuItem = document.getElementById( 'wp-admin-bar-notes' );
	if ( ! notesMenuItem ) {
		return;
	}

	registerSurveySuppressor( {
		reason: 'notifications',
		isActive: () => notesMenuItem.classList.contains( 'wpnt-show' ),
		subscribe: ( onChange ) => {
			const observer = new window.MutationObserver( onChange );
			observer.observe( notesMenuItem, { attributes: true, attributeFilter: [ 'class' ] } );
			return () => observer.disconnect();
		},
	} );
}

function init() {
	// Emitted by class-survicate.php (jetpack-mu-wpcom) as a `before` inline
	// script; PHP has already decided the user, screen and site are eligible.
	const config = window.wpcomSurvicateConfig;
	if ( ! config ) {
		return;
	}

	const { locale = '', traits = {} } = config;

	if ( ! shouldLoadSurvicate( { locale, isMobile: !! isMobile() } ) ) {
		return;
	}

	registerNotificationsSuppressor();

	loadSurvicateScript( SURVICATE_WORKSPACE_ID )
		.then( () => {
			setSurvicateVisitorTraits( traits );
		} )
		.catch( () => {
			// Surveys are optional; a blocked or failed SDK load is not an error.
		} );
}

init();

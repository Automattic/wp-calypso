import { loadScript } from '@automattic/load-script';
import { closeSurvicateSurvey } from './close-survey';
import debug from './debug';
import { shouldSuppressSurvey } from './invoke-event';
import { observeModals } from './modal-detection';

/**
 * Checks whether the Survicate script is already loaded on the page.
 */
export function isSurvicateScriptLoaded(): boolean {
	return typeof window._sva !== 'undefined';
}

/**
 * Loads the Survicate survey script for the given workspace.
 * Deduplication is handled by @automattic/load-script.
 */
export function loadSurvicateScript( workspaceId: string ): Promise< void > {
	debug( 'Loading Survicate script for workspace %s', workspaceId );

	window.addEventListener(
		'SurvicateReady',
		function () {
			window._sva?.addEventListener?.( 'survey_displayed', () => {
				debug( 'Survicate survey displayed' );

				if ( shouldSuppressSurvey() ) {
					debug( 'Survicate survey suppressed (Help Center or a modal is open)' );
					closeSurvicateSurvey();
				}
			} );

			// Close a survey that is already on screen when a modal opens on
			// top of it. Page-lifetime, like the survey_displayed listener
			// above; closeSurvicateSurvey() is a no-op without a visible survey.
			observeModals( closeSurvicateSurvey );
		},
		{ once: true }
	);

	return loadScript(
		`https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`
	).then( () => {
		debug( 'Survicate script loaded successfully' );
	} );
}

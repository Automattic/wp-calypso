import { loadScript } from '@automattic/load-script';
import { closeSurvicateSurvey } from './close-survey';
import debug from './debug';
import { isHelpCenterOpen } from './invoke-event';

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

				if ( isHelpCenterOpen() ) {
					debug( 'Survicate survey suppressed (Help Center is open)' );
					closeSurvicateSurvey();
				}
			} );
		},
		{ once: true }
	);

	return loadScript(
		`https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`
	).then( () => {
		debug( 'Survicate script loaded successfully' );
	} );
}

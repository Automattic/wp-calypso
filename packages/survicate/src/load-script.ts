import { loadScript } from '@automattic/load-script';
import { addSurvicateSurveyClosedListener } from './visitor-traits';

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
	return loadScript(
		`https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`
	).then( () => {
		addSurvicateSurveyClosedListener();
	} );
}

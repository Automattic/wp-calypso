import { loadScript } from '@automattic/load-script';
import debug from './debug';

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
	return loadScript(
		`https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`
	).then( () => {
		debug( 'Survicate script loaded successfully' );
	} );
}

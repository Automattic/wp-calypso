import { loadScript } from '@automattic/load-script';

/**
 * Loads the Survicate survey script for the given workspace.
 * Deduplication is handled by @automattic/load-script.
 */
export function loadSurvicateScript( workspaceId: string ): Promise< void > {
	return loadScript( `https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js` );
}

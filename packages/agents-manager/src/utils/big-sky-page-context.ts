import { getAmEditorPostContext } from '../abilities';
import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import type { ContextProvider } from '../extension-types';

/** Whether Big Sky is enabled on the site, as Big Sky's PHP tells AM. */
export function isBigSkyEnabled(): boolean {
	return getAgentsManagerInlineData()?.bigSkyEnabled === true;
}

/**
 * The page or post editor, from the admin body classes. The site editor's
 * client is added for every provider.
 */
function getPostEditorClient(): string | undefined {
	const { classList } = document.body;

	if ( ! classList.contains( 'post-php' ) && ! classList.contains( 'post-new-php' ) ) {
		return undefined;
	}

	if ( classList.contains( 'post-type-page' ) ) {
		return 'page-editor';
	}

	return classList.contains( 'post-type-post' ) ? 'post-editor' : undefined;
}

/** Big Sky's page context: where the user is, which editor, and the open post. */
export const bigSkyPageContextProvider: ContextProvider = {
	getClientContext: () => {
		const client = getPostEditorClient();

		return {
			url: window.location.href,
			pathname: window.location.pathname,
			search: window.location.search,
			// The backend picks its routes by environment; Big Sky's are under this one.
			environment: 'wp-admin',
			...getAmEditorPostContext(),
			...( client && { constructorArguments: { client } } ),
		};
	},
};

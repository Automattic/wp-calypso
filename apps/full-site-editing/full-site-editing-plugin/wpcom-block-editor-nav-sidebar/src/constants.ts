export const STORE_KEY = 'automattic/block-editor-nav-sidebar';

declare global {
	interface Window {
		wpcomBlockEditorNavSidebar?: {
			homeUrl: string;
			postIdsToExclude: string[];
		};
	}
}

export const SITE_HOME_URL = window.wpcomBlockEditorNavSidebar?.homeUrl;
export const POST_IDS_TO_EXCLUDE = ( window.wpcomBlockEditorNavSidebar?.postIdsToExclude || [] )
	.map( ( id ) => parseInt( id, 10 ) )
	.filter( ( id ) => ! isNaN( id ) );

export const STORE_KEY = 'automattic/block-editor-nav-sidebar';

declare global {
	interface Window {
		wpcomBlockEditorNavSidebar?: {
			postIdsToExclude: string[];
		};
	}
}

export const POST_IDS_TO_EXCLUDE = ( window.wpcomBlockEditorNavSidebar?.postIdsToExclude || [] )
	.map( ( id ) => parseInt( id, 10 ) )
	.filter( ( id ) => ! isNaN( id ) );

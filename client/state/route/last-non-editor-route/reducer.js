import { ROUTE_SET } from 'calypso/state/action-types';

/**
 * Include paths which start in the classic editor because it is common
 * to redirect from classic to block editor. For example, to create a new
 * page, you go to `/page`, which then redirects to `/block-editor/page`.
 * Matching page or post handles that case.
 */
const editorPattern = /^\/(block-editor|site-editor|page[^s]|post[^s])/;

export const lastNonEditorRouteReducer = ( state = '', action ) => {
	const { path, type } = action;
	switch ( type ) {
		case ROUTE_SET:
			if ( path && ! editorPattern.test( path ) ) {
				return path;
			}
			return state;

		default:
			return state;
	}
};

export default lastNonEditorRouteReducer;

/**
 * External dependencies
 */
import { dropRightWhile, get, last } from 'lodash';

/**
 * Internal dependencies
 */
import { getRouteHistory } from 'state/ui/action-log/selectors';
import getPreviousPath from 'state/selectors/get-previous-path';
import createSelector from 'lib/create-selector';

/**
 * Get the last non-editor route while ignoring navigation in block editor.
 *
 * @param {object} state  Global state tree
 * @returns {string} The last non editor route -- empty string if none.
 */
const getLastNonEditorRoute = createSelector(
	( state ) => {
		const previousPath = getPreviousPath( state );

		/**
		 * Include paths which start in the classic editor because it is common
		 * to redirect from classic to block editor. For example, to create a new
		 * page, you go to `/page`, which then redirects to `/block-editor/page`.
		 * Matching page or post handles that case.
		 */
		const editorPattern = /^\/(block-editor|page[^s]|post[^s])/;

		if ( previousPath && ! editorPattern.test( previousPath ) ) {
			return previousPath;
		}

		// Fall back to reading from the action log
		return get(
			last(
				dropRightWhile(
					getRouteHistory( state ),
					( { path } ) => path && editorPattern.test( path )
				)
			),
			'path',
			''
		);
	},
	( state ) => [ getPreviousPath( state ), getRouteHistory( state ) ]
);

export default getLastNonEditorRoute;

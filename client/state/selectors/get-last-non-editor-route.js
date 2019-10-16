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
 * @param {Object} state  Global state tree
 * @return {string} The last non block editor route -- empty string if none.
 */
export default createSelector(
	state => {
		const previousPath = getPreviousPath( state );
		const blockEditorPattern = /^\/block-editor/;

		if ( previousPath && ! blockEditorPattern.test( previousPath ) ) {
			return previousPath;
		}

		// Fall back to reading from the action log
		return get(
			last(
				dropRightWhile(
					getRouteHistory( state ),
					( { path } ) => path && blockEditorPattern.test( path )
				)
			),
			'path',
			''
		);
	},
	state => [ getPreviousPath( state ), getRouteHistory( state ) ]
);

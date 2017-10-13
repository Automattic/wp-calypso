/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { map } from 'lodash';

// TODO: after switching to React 16, remove wrapping <div> and return just an array
const EditorDiffChanges = ( { changes } ) => (
	<div>
		{ map( changes, ( change, changeIndex ) => {
			const changeClassNames = classNames( {
				'editor-diff-viewer__additions': change.added,
				'editor-diff-viewer__deletions': change.removed,
			} );
			return (
				<span className={ changeClassNames } key={ changeIndex }>
					{ change.value }
				</span>
			);
		} ) }
	</div>
);

EditorDiffChanges.propTypes = {
	changes: PropTypes.arrayOf(
		PropTypes.shape( {
			value: PropTypes.string.isRequired,
			added: PropTypes.boolean,
			removed: PropTypes.removed,
			count: PropTypes.number,
		} ).isRequired
	),
};

export default EditorDiffChanges;

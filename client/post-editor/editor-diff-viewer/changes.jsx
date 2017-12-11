/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { isArray, isEmpty, map } from 'lodash';

const addLinesToChanges = changes => {
	if ( ! isArray( changes ) || isEmpty( changes ) ) {
		return changes;
	}
	return changes.join( '\n\n' );
};

const renderChange = ( change, changeIndex, splitLines ) => {
	switch ( change.op ) {
		case 'add': {
			const content = change.final || change.value;
			return (
				<span className="editor-diff-viewer__additions" key={ changeIndex }>
					{ splitLines ? addLinesToChanges( content ) : content }
				</span>
			);
		}
		case 'copy': {
			const content = change.final || change.value;
			return (
				<span className="editor-diff-viewer__context" key={ changeIndex }>
					{ splitLines ? addLinesToChanges( content ) : content }
				</span>
			);
		}
		case 'del': {
			const content = change.orig || change.value;
			return (
				<span className="editor-diff-viewer__deletions" key={ changeIndex }>
					{ splitLines ? addLinesToChanges( content ) : content }
				</span>
			);
		}
	}
};

const EditorDiffChanges = ( { changes, splitLines } ) =>
	map( changes, ( change, changeIndex ) => renderChange( change, changeIndex, splitLines ) );

EditorDiffChanges.propTypes = {
	changes: PropTypes.array,
	splitLines: PropTypes.bool,
};

export default EditorDiffChanges;

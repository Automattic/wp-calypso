/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostRevisionChanges } from 'state/selectors';

const EditorDiffViewer = ( { revisionChanges } ) => (
	<div className="editor-diff-viewer">
		<h1 className="editor-diff-viewer__title">
			{ map( revisionChanges.title, ( change, changeIndex ) => {
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
		</h1>
		<pre className="editor-diff-viewer__content">
			{ map( revisionChanges.content, ( change, changeIndex ) => {
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
		</pre>
	</div>
);

EditorDiffViewer.propTypes = {
	revisionChanges: PropTypes.object.isRequired,
	postId: PropTypes.number,
	revision: PropTypes.object,
	selectedRevisionId: PropTypes.number,
	siteId: PropTypes.number,
};

export default connect( ( state, { siteId, postId, selectedRevisionId } ) => ( {
	revisionChanges: getPostRevisionChanges( state, siteId, postId, selectedRevisionId ),
} ) )( EditorDiffViewer );

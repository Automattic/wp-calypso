/**
 * External dependencies
 */
import classNames from 'classnames';
import { get, map } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPostRevision, getPostRevisionChanges } from 'state/selectors';

const EditorDiffViewer = ( { contentChanges, revision } ) => (
	<div className="editor-diff-viewer">
		<h1 className="editor-diff-viewer__title">
			{ get( revision, 'title' ) }
		</h1>
		<div className="editor-diff-viewer__content">
			{ map( contentChanges, ( change, changeIndex ) => {
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
	</div>
);

EditorDiffViewer.propTypes = {
	contentChanges: PropTypes.array.isRequired,
	postId: PropTypes.number,
	revision: PropTypes.object,
	selectedRevisionId: PropTypes.number,
	siteId: PropTypes.number,
};

export default connect(
	( state, { siteId, postId, selectedRevisionId } ) => ( {
		contentChanges: getPostRevisionChanges( state, siteId, postId, selectedRevisionId ),
		revision: getPostRevision( state, siteId, postId, selectedRevisionId, 'editing' ),
	} )
)( EditorDiffViewer );

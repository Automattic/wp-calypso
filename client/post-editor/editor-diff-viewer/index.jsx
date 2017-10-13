/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPostRevisionChanges } from 'state/selectors';
import EditorDiffChanges from './changes';

const EditorDiffViewer = ( { revisionChanges } ) => (
	<div className="editor-diff-viewer">
		<h1 className="editor-diff-viewer__title">
			<EditorDiffChanges changes={ revisionChanges.title } />
		</h1>
		<pre className="editor-diff-viewer__content">
			<EditorDiffChanges changes={ revisionChanges.content } />
		</pre>
	</div>
);

EditorDiffViewer.propTypes = {
	revisionChanges: PropTypes.shape( {
		title: PropTypes.array,
		content: PropTypes.array,
	} ).isRequired,
	postId: PropTypes.number,
	revision: PropTypes.object,
	selectedRevisionId: PropTypes.number,
	siteId: PropTypes.number,
};

export default connect( ( state, { siteId, postId, selectedRevisionId } ) => ( {
	revisionChanges: getPostRevisionChanges( state, siteId, postId, selectedRevisionId ),
} ) )( EditorDiffViewer );

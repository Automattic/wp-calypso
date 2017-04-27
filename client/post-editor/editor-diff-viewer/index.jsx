/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	getPostRevision,
	normalizeForDisplay,
} from 'state/posts/revisions/selectors';

class EditorDiffViewer extends PureComponent {
	render() {
		return (
			<div className="editor-diff-viewer">
				<h3 className="editor-diff-viewer__title">
					{ this.props.revision.title }
				</h3>
				{ this.props.revision.content }
			</div>
		);
	}
}

EditorDiffViewer.propTypes = {
	postId: PropTypes.number,
	revision: PropTypes.object,
	selectedRevisionId: PropTypes.number,
	siteId: PropTypes.number,
};

export default connect(
	( state, ownProps ) => ( {
		revision: normalizeForDisplay( getPostRevision( state, ownProps.siteId, ownProps.postId, ownProps.selectedRevisionId ) ),
	} )
)( EditorDiffViewer );

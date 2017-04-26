/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getNormalizedPostRevision } from 'state/posts/revisions/selectors';

class EditorDiffViewer extends PureComponent {
	render() {
		return (
			<div>
				<h3>{ this.props.revision.title }</h3>
				{ this.props.revision.content }
			</div>
		);
	}
}

EditorDiffViewer.propTypes = {
	postId: PropTypes.number,
	revision: PropTypes.object,
	revisionId: PropTypes.number,
	siteId: PropTypes.number,
};

export default connect(
	( state, ownProps ) => ( {
		revision: getNormalizedPostRevision( state, ownProps.siteId, ownProps.postId, ownProps.revisionId ),
	} )
)( EditorDiffViewer );

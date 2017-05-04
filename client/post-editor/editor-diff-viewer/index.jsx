/**
 * External dependencies
 */
import classNames from 'classnames';
import { map } from 'lodash';
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	getPostRevision,
	getPostRevisionChanges,
	normalizeForDisplay,
} from 'state/posts/revisions/selectors';

class EditorDiffViewer extends PureComponent {
	render() {
		return (
			<div className="editor-diff-viewer">
				<h1 className="editor-diff-viewer__title">
					{ this.props.revision.title }
				</h1>
				{ map( this.props.contentChanges, ( change, changeIndex ) => {
					const changeClassNames = classNames( {
						'editor-diff-viewer__additions': change.added,
						'editor-diff-viewer__deletions': change.removed,
					} );
					return (
						<span key={ changeIndex } className={ changeClassNames }>
							{ change.value }
						</span>
					);
				} ) }
			</div>
		);
	}
}

EditorDiffViewer.propTypes = {
	contentChanges: PropTypes.array,
	postId: PropTypes.number,
	revision: PropTypes.object,
	selectedRevisionId: PropTypes.number,
	siteId: PropTypes.number,
};

export default connect(
	( state, ownProps ) => ( {
		contentChanges: getPostRevisionChanges( state, ownProps.siteId, ownProps.postId, ownProps.selectedRevisionId ),
		revision: normalizeForDisplay(
			getPostRevision( state, ownProps.siteId, ownProps.postId, ownProps.selectedRevisionId )
		),
	} )
)( EditorDiffViewer );

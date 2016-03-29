/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	getEditorLastDraftPost,
	getEditorLastDraftSiteId,
	getEditorLastDraftPostId
} from 'state/ui/editor/last-draft/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getSectionName } from 'state/ui/selectors';
import { decodeEntities } from 'lib/formatting';
import QueryPosts from 'components/data/query-posts';

const ResumeEditing = React.createClass( {
	propTypes: {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		draft: PropTypes.object,
		editPath: PropTypes.string,
		section: PropTypes.string
	},

	render: function() {
		const { siteId, postId, draft, editPath, section } = this.props;
		if ( ! draft || 'post-editor' === section ) {
			return null;
		}

		return (
			<a href={ editPath } className="resume-editing">
				<QueryPosts siteId={ siteId } postId={ postId } />
				<span className="resume-editing__label">{ this.translate( 'Continue Editing' ) }</span>
				<span className="resume-editing__post-title">{ decodeEntities( draft.title ) }</span>
			</a>
		);
	}
} );

export default connect( ( state ) => {
	const siteId = getEditorLastDraftSiteId( state );
	const postId = getEditorLastDraftPostId( state );

	return {
		siteId,
		postId,
		draft: getEditorLastDraftPost( state ),
		editPath: getEditorPath( state, siteId, postId ),
		section: getSectionName( state )
	};
} )( ResumeEditing );

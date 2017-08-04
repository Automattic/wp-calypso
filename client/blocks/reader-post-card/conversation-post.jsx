/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { map, take } from 'lodash';

/**
 * Internal Dependencies
 */
import ConversationPostList from 'blocks/conversations/list';
import CompactPostCard from 'blocks/reader-post-card/compact';
import { getDateSortedPostComments } from 'state/comments/selectors';

class ConversationPost extends React.Component {
	static propTypes = {
		post: React.PropTypes.object.isRequired,
		comments: React.PropTypes.array.isRequired,
	};

	render() {
		const commentIdsToShow = map( take( this.props.comments, 3 ), 'ID' );
		return (
			<div className="reader-post-card__conversation-post">
				<CompactPostCard { ...this.props } />
				<ConversationPostList post={ this.props.post } commentIds={ commentIdsToShow } />
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { site_ID: siteId, ID: postId } = ownProps.post;
	return {
		comments: getDateSortedPostComments( state, siteId, postId ),
	};
} )( ConversationPost );

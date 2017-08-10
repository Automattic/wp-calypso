/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map, takeRight, filter } from 'lodash';

/**
 * Internal Dependencies
 */
import ConversationPostList from 'blocks/conversations/list';
import CompactPostCard from 'blocks/reader-post-card/compact';
import { getDateSortedPostComments } from 'state/comments/selectors';

class ConversationPost extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		comments: PropTypes.array.isRequired,
	};

	render() {
		const commentIdsToShow = map(
			takeRight(
				filter(
					this.props.comments,
					comment => comment.type !== 'trackback' && comment.type !== 'pingback'
				),
				3
			),
			'ID'
		);

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

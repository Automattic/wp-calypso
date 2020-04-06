/**
 * External Dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InView } from 'react-intersection-observer';

/**
 * Internal Dependencies
 */
import ConversationPostList from 'blocks/conversations/list';
import CompactPostCard from 'blocks/reader-post-card/compact';
import { setViewFeedPost, unsetViewFeedPost } from 'state/reader/viewing/actions';
import { getSite } from 'state/sites/selectors';

class ConversationPost extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		commentIds: PropTypes.array.isRequired,
	};

	toggleItemView = inView => {
		const { post } = this.props;
		if ( inView ) {
			this.props.setViewFeedPost( { siteId: post.site_ID, postId: post.ID } );
			return;
		}
		this.props.unsetViewFeedPost( { siteId: post.site_ID, postId: post.ID } );
	};

	render() {
		return (
			<div className="reader-post-card__conversation-post">
				<CompactPostCard { ...this.props } />
				<InView onChange={ this.toggleItemView }>
					<ConversationPostList post={ this.props.post } commentIds={ this.props.commentIds } />
				</InView>
			</div>
		);
	}
}
export default connect(
	( state, ownProps ) => {
		return {
			site: getSite( state, ownProps.post.site_ID ),
		};
	},
	{ setViewFeedPost, unsetViewFeedPost },
	null
)( ConversationPost );

/** @format */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

/***
 * Internal dependencies
 */
import PostComment from 'blocks/comments/post-comment';
import {
	getPostCommentsTree,
	commentsFetchingStatus,
	getAllCommentSinceLatestViewed,
	getRootNeedsCaterpillar,
	getExpansionsForPost,
} from 'state/comments/selectors';
import { requestPostComments } from 'state/comments/actions';
import ConversationCaterpillar from 'blocks/conversation-caterpillar';

export class ConversationCommentList extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired, // required by PostComment
	};

	static defaultProps = {
		showCaterpillar: true,
	};

	reqMoreComments = ( props = this.props ) => {
		if ( ! this.props.showCaterpillar ) {
			return;
		}

		const { blogId, postId } = props;
		const { haveEarlierCommentsToFetch, haveLaterCommentsToFetch } = props.commentsFetchingStatus;

		if ( haveEarlierCommentsToFetch || haveLaterCommentsToFetch ) {
			props.requestPostComments( { siteId: blogId, postId } );
		}
	};
	componentWillMount() {
		this.reqMoreComments();
	}

	// componentWillReceiveProps( nextProps ) {
	// this.reqMoreComments( nextProps );
	// }

	shouldComponentUpdate( nextProps ) {
		const prevProps = this.props;
		return (
			prevProps.hiddenComments !== nextProps.hiddenComments ||
			prevProps.expansions !== nextProps.expansions ||
			prevProps.newComments !== nextProps.newComments
		);
	}

	render() {
		const {
			postId,
			blogId,
			newComments,
			commentsTree,
			post,
			showCaterpillar,
			needsCaterpillar,
			expansions,
		} = this.props;

		const toShow = { ...newComments, ...expansions };
		return (
			<div className="conversations__comment-list">
				{ showCaterpillar &&
					needsCaterpillar &&
					<ConversationCaterpillar isRoot blogId={ blogId } postId={ postId } /> }
				<ul className="conversations__comment-list-ul">
					{ map( commentsTree.children, commentId => {
						return (
							<PostComment
								showNestingReplyArrow
								commentsTree={ commentsTree }
								key={ commentId }
								commentId={ commentId }
								maxChildrenToShow={ 0 }
								post={ post }
								showCaterpillar={ showCaterpillar }
								toShow={ toShow }
								maxDepth={ 1 }
							/>
						);
					} ) }
				</ul>
			</div>
		);
	}
}

const ConnectedConversationCommentList = connect(
	( state, ownProps ) => {
		const { post } = ownProps;
		const { discussion, site_ID: blogId, ID: postId } = post;

		return {
			commentsTree: getPostCommentsTree( state, blogId, postId, 'all' ),
			commentsFetchingStatus:
				commentsFetchingStatus( state, blogId, postId, discussion.comment_count ) || {},
			blogId,
			postId,
			newComments: getAllCommentSinceLatestViewed( state, blogId, postId ),
			needsCaterpillar: getRootNeedsCaterpillar( state, blogId, postId ),
			expansions: getExpansionsForPost( state, blogId, postId ),
		};
	},
	{ requestPostComments }
)( ConversationCommentList );

export default ConnectedConversationCommentList;

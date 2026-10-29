import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { Interval, EVERY_MINUTE } from 'calypso/lib/interval';
import { CommentEditorContext } from './comment-editor-context';
import PostCommentsList from './post-comment-list';
import { usePostCommentsData } from './use-post-comments-data';

class PostComments extends Component {
	static propTypes = {
		shouldHighlightNew: PropTypes.bool,
		highlightedCommentIds: PropTypes.arrayOf( PropTypes.number ),
		collapsibleThreads: PropTypes.bool,
		useBlockEditor: PropTypes.bool,
		post: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			site_ID: PropTypes.number.isRequired,
		} ).isRequired,
	};

	static defaultProps = {
		shouldHighlightNew: false,
		highlightedCommentIds: [],
		collapsibleThreads: false,
		shouldPollForNewComments: false,
		useBlockEditor: false,
	};

	pollForNewComments = () => {
		this.props.fetchLaterComments();
	};

	render() {
		const { siteId, postId, shouldPollForNewComments, useBlockEditor } = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		return (
			<Fragment>
				{ shouldPollForNewComments && (
					<Interval onTick={ this.pollForNewComments } period={ EVERY_MINUTE } />
				) }
				<CommentEditorContext.Provider value={ useBlockEditor }>
					<PostCommentsList { ...this.props } />
				</CommentEditorContext.Provider>
			</Fragment>
		);
	}
}

const PostCommentsWithData = ( props ) => {
	const commentsData = usePostCommentsData( props );

	if ( ! commentsData.siteId || ! commentsData.postId ) {
		return null;
	}

	return <PostComments { ...props } { ...commentsData } />;
};

export default localize( PostCommentsWithData );

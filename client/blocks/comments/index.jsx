import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { Interval, EVERY_MINUTE } from 'calypso/lib/interval';
import { CommentEditorContext } from './comment-editor-context';
import { CommentLabelsContext } from './comment-labels-context';
import NewCommentsPill from './new-comments-pill';
import PostCommentsList from './post-comment-list';
import { usePostCommentsData } from './use-post-comments-data';

class PostComments extends Component {
	static propTypes = {
		deferNewComments: PropTypes.bool,
		shouldHighlightNew: PropTypes.bool,
		spellOutLabels: PropTypes.bool,
		useBlockEditor: PropTypes.bool,
		post: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			site_ID: PropTypes.number.isRequired,
		} ).isRequired,
	};

	static defaultProps = {
		deferNewComments: false,
		shouldHighlightNew: false,
		shouldPollForNewComments: false,
		spellOutLabels: false,
		useBlockEditor: false,
	};

	pollForNewComments = () => {
		this.props.pollForNewComments();
	};

	render() {
		const {
			siteId,
			postId,
			deferNewComments,
			pendingCommentIds,
			revealPendingComments,
			shouldPollForNewComments,
			spellOutLabels,
			useBlockEditor,
		} = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		return (
			<Fragment>
				{ shouldPollForNewComments && (
					<Interval onTick={ this.pollForNewComments } period={ EVERY_MINUTE } />
				) }
				<CommentEditorContext.Provider value={ useBlockEditor }>
					<CommentLabelsContext.Provider value={ spellOutLabels }>
						<PostCommentsList { ...this.props } />
					</CommentLabelsContext.Provider>
				</CommentEditorContext.Provider>
				{ deferNewComments && (
					<NewCommentsPill commentIds={ pendingCommentIds } onReveal={ revealPendingComments } />
				) }
			</Fragment>
		);
	}
}

const PostCommentsWithData = ( props ) => {
	const commentsData = usePostCommentsData( props );

	if ( ! commentsData.siteId || ! commentsData.postId ) {
		return null;
	}

	if ( commentsData.isCommentsLoading && props.loadingPlaceholder ) {
		return props.loadingPlaceholder;
	}

	return <PostComments { ...props } { ...commentsData } />;
};

export default localize( PostCommentsWithData );

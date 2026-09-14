import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { Interval, EVERY_MINUTE } from 'calypso/lib/interval';
import PostCommentsList from './post-comment-list';
import { usePostCommentsData } from './use-post-comments-data';

class PostComments extends Component {
	static propTypes = {
		shouldHighlightNew: PropTypes.bool,
		post: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			site_ID: PropTypes.number.isRequired,
		} ).isRequired,
	};

	static defaultProps = {
		shouldHighlightNew: false,
		shouldPollForNewComments: false,
	};

	pollForNewComments = () => {
		this.props.fetchLaterComments();
	};

	render() {
		const { siteId, postId, shouldPollForNewComments } = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		return (
			<Fragment>
				{ shouldPollForNewComments && (
					<Interval onTick={ this.pollForNewComments } period={ EVERY_MINUTE } />
				) }
				<PostCommentsList { ...this.props } />
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

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostCommentsList from './post-comment-list';
import { Interval, EVERY_MINUTE } from 'calypso/lib/interval';
import { requestPostComments } from 'calypso/state/comments/actions';

class PostComments extends React.Component {
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
		const { siteId, postId } = this.props;

		// Request page of comments
		this.props.requestPostComments( {
			siteId,
			postId,
			isPoll: true,
			direction: 'after',
		} );
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

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps.post.site_ID;
		const postId = ownProps.post.ID;

		return {
			siteId,
			postId,
		};
	},
	{
		requestPostComments,
	}
)( localize( PostComments ) );

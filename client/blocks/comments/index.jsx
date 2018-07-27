/** @format */

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
import Interval, { EVERY_MINUTE } from 'lib/interval';
import { requestPostComments } from 'state/comments/actions';

class PostComments extends React.Component {
	static propTypes = {
		post: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			site_ID: PropTypes.number.isRequired,
		} ).isRequired,
	};

	static defaultProps = {
		shouldPollForNewComments: true,
	};

	pollForNewComments = () => {
		if ( ! this.props.post ) {
			return;
		}

		const { ID: postId, site_ID: siteId } = this.props.post;
		// Request page of comments
		// @todo add most recent comment date
		this.props.requestPostComments( { siteId, postId, isPoll: true } );
	};

	render() {
		return (
			<Fragment>
				{ this.props.shouldPollForNewComments && (
					<Interval onTick={ this.pollForNewComments } period={ EVERY_MINUTE } />
				) }
				<PostCommentsList { ...this.props } />
			</Fragment>
		);
	}
}

export default connect(
	null,
	{
		requestPostComments,
	}
)( localize( PostComments ) );

/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import PostCommentsList from './post-comment-list';
import Interval, { EVERY_MINUTE } from 'lib/interval';

class PostComments extends React.Component {
	static defaultProps = {
		shouldPollForNewComments: true,
	};

	pollForNewComments = () => {
		alert( 'poll ' );
		// request page of comments
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

export default PostComments;

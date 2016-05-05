/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import CommentConstants from 'lib/comment-store/constants';

const PostCommentContent = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		content: PropTypes.string.isRequired,
		state: PropTypes.string,
	},

	render() {
		// Don't trust comment content unless it was provided by the API
		if ( this.props.state === CommentConstants.state.PENDING ) {
			return <div className="comment__content">{ this.props.content }</div>;
		}

		/*eslint-disable react/no-danger*/
		return (
			<div className="comment__content" dangerouslySetInnerHTML={{ __html: this.props.content }}>
			</div>
		);
		/*eslint-enable react/no-danger*/
	}
} );

export default PostCommentContent;

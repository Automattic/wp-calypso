import React, { PropTypes } from 'react/addons';
import CommentConstants from 'lib/comment-store/constants';

const PostCommentContent = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		content: PropTypes.string.isRequired,
		state: PropTypes.string,
	},

	render() {
		// Don't trust comment content unless it was provided by the API
		if ( this.props.state === CommentConstants.state.PENDING ) {
			return <div className="comment__content">{ this.props.content }</div>;
		}

		return (
			<div className="comment__content" dangerouslySetInnerHTML={{ __html: this.props.content }}>
			</div>
		);
	}
} );

export default PostCommentContent;

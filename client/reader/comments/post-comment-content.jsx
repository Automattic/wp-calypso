/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

export default class PostCommentContent extends React.Component {
	render() {
		// Don't trust comment content unless it was provided by the API
		if ( this.props.isPlaceholder ) {
			return <div className="comment__content">{ this.props.content }</div>;
		}

		/*eslint-disable react/no-danger*/
		return (
			<div className="comment__content" dangerouslySetInnerHTML={ { __html: this.props.content } }>
			</div>
		);
		/*eslint-enable react/no-danger*/
	}
}

PostCommentContent.propTypes = {
	content: PropTypes.string.isRequired,
	isPlaceholder: PropTypes.bool
};

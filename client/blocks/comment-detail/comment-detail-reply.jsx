/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

export class CommentDetailReply extends Component {
	render() {
		const { translate } = this.props;

		return (
			<div className="comment-detail__reply">
				<textarea placeholder={ translate( 'Reply' ) }></textarea>
			</div>
		);
	}
}

export default localize( CommentDetailReply );

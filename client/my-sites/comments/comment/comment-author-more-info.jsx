/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';

export class CommentAuthorMoreInfo extends Component {
	storeLabelRef = label => ( this.authorMoreInfoLabel = label );

	storePopoverRef = popover => ( this.authorMoreInfoPopover = popover );

	openAuthorMoreInfoPopover = event => this.authorMoreInfoPopover.handleClick( event );

	render() {
		return (
			<div
				className="comment__author-more-info"
				onClick={ this.openAuthorMoreInfoPopover }
				ref={ this.storeLabelRef }
			>
				<InfoPopover ignoreContext={ this.authorMoreInfoLabel } ref={ this.storePopoverRef }>
					Author More Info
				</InfoPopover>
				<label>User Info</label>
			</div>
		);
	}
}

export default CommentAuthorMoreInfo;

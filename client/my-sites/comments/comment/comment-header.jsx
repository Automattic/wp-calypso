/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CommentAuthor from 'calypso/my-sites/comments/comment/comment-author';
import CommentAuthorMoreInfo from 'calypso/my-sites/comments/comment/comment-author-more-info';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { getSiteComment } from 'calypso/state/comments/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export class CommentHeader extends PureComponent {
	render() {
		const {
			commentId,
			isBulkMode,
			isPostView,
			isSelected,
			showAuthorMoreInfo,
			isDisabled,
		} = this.props;

		return (
			<div className="comment__header">
				{ isBulkMode && (
					<span className="comment__bulk-select">
						<FormCheckbox checked={ isSelected } disabled={ isDisabled } readOnly tabIndex="0" />
					</span>
				) }

				<CommentAuthor { ...{ commentId, isBulkMode, isPostView } } />

				{ showAuthorMoreInfo && <CommentAuthorMoreInfo { ...{ commentId } } /> }
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId, isBulkMode } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	const commentType = get( comment, 'type', 'comment' );
	const canModerateComment = get( comment, 'can_moderate', false );

	return {
		showAuthorMoreInfo: ! isBulkMode && 'comment' === commentType,
		isDisabled: ! canModerateComment,
	};
};

export default connect( mapStateToProps )( CommentHeader );

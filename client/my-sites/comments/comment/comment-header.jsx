/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CommentAuthor from 'my-sites/comments/comment/comment-author';
import CommentAuthorMoreInfo from 'my-sites/comments/comment/comment-author-more-info';
import FormCheckbox from 'components/forms/form-checkbox';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class CommentHeader extends PureComponent {
	render() {
		const { commentId, isBulkMode, isPostView, isSelected, showAuthorMoreInfo } = this.props;

		return (
			<div className="comment__header">
				{ isBulkMode && (
					<span className="comment__bulk-select">
						<FormCheckbox checked={ isSelected } tabIndex="0" />
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

	return {
		showAuthorMoreInfo: ! isBulkMode && 'comment' === commentType,
	};
};

export default connect( mapStateToProps )( CommentHeader );

/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CommentAuthor from 'my-sites/comments/comment/comment-author';
import CommentAuthorMoreInfo from 'my-sites/comments/comment/comment-author-more-info';
import FormCheckbox from 'components/forms/form-checkbox';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class CommentHeader extends PureComponent {
	render() {
		const {
			commentId,
			isBulkMode,
			isEditMode,
			isExpanded,
			isPostView,
			isSelected,
			showAuthorMoreInfo,
			toggleExpanded,
		} = this.props;

		return (
			<div className="comment__header">
				{ isBulkMode && (
					<label className="comment__bulk-select">
						<FormCheckbox checked={ isSelected } />
					</label>
				) }

				<CommentAuthor { ...{ commentId, isExpanded, isPostView } } />

				{ showAuthorMoreInfo && <CommentAuthorMoreInfo { ...{ commentId } } /> }

				{ ! isBulkMode &&
				isPostView && (
					<Button
						borderless
						className="comment__toggle-expanded"
						disabled={ isEditMode }
						onClick={ toggleExpanded }
					>
						<Gridicon icon="chevron-down" />
					</Button>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId, isExpanded } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	const commentType = get( comment, 'type', 'comment' );

	return {
		showAuthorMoreInfo: isExpanded && 'comment' === commentType,
	};
};

export default connect( mapStateToProps )( CommentHeader );

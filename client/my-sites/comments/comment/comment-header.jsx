/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CommentAuthor from 'my-sites/comments/comment/comment-author';
import CommentAuthorMoreInfo from 'my-sites/comments/comment/comment-author-more-info';
import FormCheckbox from 'components/forms/form-checkbox';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export const CommentHeader = ( {
	commentId,
	isBulkMode,
	isEditMode,
	isExpanded,
	isSelected,
	showAuthorMoreInfo,
	toggleExpanded,
} ) => (
	<div className="comment__header">
		{ isBulkMode && (
			<label className="comment__bulk-select">
				<FormCheckbox checked={ isSelected } onChange={ noop } />
			</label>
		) }

		<CommentAuthor { ...{ commentId, isExpanded } } />

		{ showAuthorMoreInfo && <CommentAuthorMoreInfo { ...{ commentId } } /> }

		{ ! isBulkMode && (
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

const mapStateToProps = ( state, { commentId, isExpanded } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	const commentType = get( comment, 'type', 'comment' );

	return {
		showAuthorMoreInfo: isExpanded && 'comment' === commentType,
	};
};

export default connect( mapStateToProps )( CommentHeader );

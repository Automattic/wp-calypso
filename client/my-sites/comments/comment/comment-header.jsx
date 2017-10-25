/** @format */
/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import noop from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CommentAuthor from 'my-sites/comments/comment/comment-author';
import CommentAuthorMoreInfo from 'my-sites/comments/comment/comment-author-more-info';
import FormCheckbox from 'components/forms/form-checkbox';

export const CommentHeader = ( {
	commentId,
	isBulkMode,
	isEditMode,
	isExpanded,
	isSelected,
	toggleExpanded,
} ) => (
	<div className="comment__header" onClick={ ! isExpanded && ! isBulkMode ? toggleExpanded : noop }>
		{ isBulkMode && (
			<label className="comment__bulk-select">
				<FormCheckbox checked={ isSelected } onChange={ noop } />
			</label>
		) }

		<CommentAuthor { ...{ commentId, isExpanded } } />

		{ isExpanded && <CommentAuthorMoreInfo /> }

		{ ! isBulkMode && (
			<Button
				borderless
				className="comment__toggle-expanded"
				disabled={ isEditMode }
				onClick={ isExpanded ? toggleExpanded : noop }
			>
				<Gridicon icon="chevron-down" />
			</Button>
		) }
	</div>
);

export default CommentHeader;

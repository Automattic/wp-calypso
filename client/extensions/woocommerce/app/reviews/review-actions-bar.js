/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';

// currentStatus is the status/tab that is currently selected in the UI.
// This is used to show the 'delete' action on the trash page.
// review.status is the status of the individual review.
const ReviewActionsBar = ( { review, currentStatus, translate } ) => {
	const isApproved = 'approved' === review.status;
	const isSpam = 'spam' === review.status;
	const isTrash = 'trash' === review.status;

	return (
		<div className="reviews__actions">
			<Button
				borderless
				className={ classNames( 'reviews__action-approve', { 'is-approved': isApproved } ) }
			>
				<Gridicon icon={ isApproved ? 'checkmark-circle' : 'checkmark' } />
				<span>{
					isApproved
						? translate( 'Approved' )
						: translate( 'Approve' )
				}</span>
			</Button>

			<Button
				borderless
				className={ classNames( 'reviews__action-spam', { 'is-spam': isSpam } ) }
			>
				<Gridicon icon="spam" />
				<span>{
					isSpam
						? translate( 'Marked as Spam' )
						: translate( 'Spam' )
				}</span>
			</Button>

			{ 'trash' === currentStatus && (
				<Button borderless className="reviews__action-delete">
					<Gridicon icon="trash" />
					<span>{ translate( 'Delete Permanently' ) }</span>
				</Button>
			) || (
				<Button
					borderless
					className={ classNames( 'reviews__action-trash', { 'is-trash': isTrash } ) }
				>
					<Gridicon icon="trash" />
					<span>{
						isTrash
							? translate( 'Trashed' )
							: translate( 'Trash' )
					}</span>
				</Button>
			) }
		</div>
	);
};

ReviewActionsBar.propTypes = {
	review: PropTypes.shape( {
		status: PropTypes.string,
	} ).isRequired,
	currentStatus: PropTypes.string.isRequired,
};

export default localize( ReviewActionsBar );

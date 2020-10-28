/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { changeReviewStatus, deleteReview } from 'woocommerce/state/sites/reviews/actions';

// currentStatus is the status/tab that is currently selected in the UI.
// This is used to show the 'delete' action on the trash page.
// review.status is the status of the individual review.
const ReviewActionsBar = ( {
	approveReview,
	currentStatus,
	deleteTheReview,
	review,
	spamReview,
	translate,
	trashReview,
	unapproveReview,
} ) => {
	const isApproved = 'approved' === review.status;
	const isSpam = 'spam' === review.status;
	const isTrash = 'trash' === review.status;

	return (
		<div className="reviews__actions">
			<Button
				borderless
				onClick={ isApproved ? unapproveReview : approveReview }
				className={ classNames( 'reviews__action-approve', { 'is-approved': isApproved } ) }
			>
				<Gridicon icon={ isApproved ? 'checkmark-circle' : 'checkmark' } />
				<span>{ isApproved ? translate( 'Approved' ) : translate( 'Approve' ) }</span>
			</Button>

			<Button
				borderless
				onClick={ spamReview }
				className={ classNames( 'reviews__action-spam', { 'is-spam': isSpam } ) }
			>
				<Gridicon icon="spam" />
				<span>{ isSpam ? translate( 'Marked as Spam' ) : translate( 'Spam' ) }</span>
			</Button>

			{ ( 'trash' === currentStatus && (
				<Button borderless className="reviews__action-delete" onClick={ deleteTheReview }>
					<Gridicon icon="trash" />
					<span>{ translate( 'Delete Permanently' ) }</span>
				</Button>
			) ) || (
				<Button
					borderless
					onClick={ trashReview }
					className={ classNames( 'reviews__action-trash', { 'is-trash': isTrash } ) }
				>
					<Gridicon icon="trash" />
					<span>{ isTrash ? translate( 'Trashed' ) : translate( 'Trash' ) }</span>
				</Button>
			) }
		</div>
	);
};

ReviewActionsBar.propTypes = {
	siteId: PropTypes.number,
	review: PropTypes.shape( {
		status: PropTypes.string,
	} ).isRequired,
	currentStatus: PropTypes.string.isRequired,
	toggleExpanded: PropTypes.func,
};

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const { review, siteId, toggleExpanded } = ownProps;
	const { product } = review;
	const postId = product.id;
	const commentId = review.id;
	return {
		approveReview: () => {
			dispatch( changeReviewStatus( siteId, postId, commentId, review.status, 'approved' ) );
			toggleExpanded();
		},
		unapproveReview: () => {
			dispatch( changeReviewStatus( siteId, postId, commentId, review.status, 'pending' ) );
			toggleExpanded();
		},
		trashReview: () => {
			dispatch( changeReviewStatus( siteId, postId, commentId, review.status, 'trash' ) );
			toggleExpanded();
		},
		deleteTheReview: () => {
			dispatch( deleteReview( siteId, postId, commentId ) );
			toggleExpanded();
		},
		spamReview: () => {
			dispatch( changeReviewStatus( siteId, postId, commentId, review.status, 'spam' ) );
			toggleExpanded();
		},
	};
};

export default connect( null, mapDispatchToProps )( localize( ReviewActionsBar ) );

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import ReviewReply from './review-reply';
import { fetchReviewReplies } from 'woocommerce/state/sites/review-replies/actions';
import { getReviewReplies } from 'woocommerce/state/sites/review-replies/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

class ReviewReplies extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		review: PropTypes.shape( {
			status: PropTypes.string,
			name: PropTypes.string,
			id: PropTypes.number,
		} ).isRequired,
	};

	componentDidMount() {
		const { siteId, review } = this.props;
		if ( siteId ) {
			this.props.fetchReviewReplies( siteId, review.id );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { siteId, review } = this.props;
		const newSiteId = newProps.siteId || null;
		const oldSiteId = siteId || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchReviewReplies( newSiteId, review.id );
		}
	}

	renderReply = ( replyId, i ) => {
		const { review } = this.props;
		return <ReviewReply
			key={ i }
			reviewId={ review.id }
			replyId={ replyId }
		/>;
	}

	render() {
		const { replyIds, review, translate } = this.props;
		const repliesOutput = replyIds.length && replyIds.map( this.renderReply ) || null;

		const textAreaPlaceholder = 'approved' === review.status
			? translate( 'Reply to %(reviewAuthor)s…', { args: { reviewAuthor: review.name } } )
			: translate( 'Approve and reply to %(reviewAuthor)s…', { args: { reviewAuthor: review.name } } );

		return (
			<div className="reviews__replies">
				{ repliesOutput }

				<form className="reviews__reply-textarea">
					<textarea placeholder={ textAreaPlaceholder } />
					<button className="reviews__reply-submit">
						{ translate( 'Send' ) }
					</button>
				</form>
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const replies = getReviewReplies( state, props.review.id );
		const replyIds = replies && replies.map( reply => reply.id ) || [];
		return {
			siteId,
			replyIds,
		};
	},
	dispatch => bindActionCreators( { fetchReviewReplies }, dispatch )
)( localize( ReviewReplies ) );

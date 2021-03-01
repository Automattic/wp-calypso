/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { fetchReviewReplies } from 'woocommerce/state/sites/review-replies/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getReviewReplies } from 'woocommerce/state/sites/review-replies/selectors';
import ReviewReply from './review-reply';
import ReviewReplyCreate from './review-reply-create';

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

	UNSAFE_componentWillReceiveProps( newProps ) {
		const { siteId, review } = this.props;
		const newSiteId = newProps.siteId || null;
		const oldSiteId = siteId || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchReviewReplies( newSiteId, review.id );
		}
	}

	renderReply = ( reply, i ) => {
		const { siteId, review } = this.props;
		return <ReviewReply siteId={ siteId } key={ i } reviewId={ review.id } replyId={ reply.id } />;
	};

	render() {
		const { siteId, replies, review } = this.props;
		const repliesOutput = replies.map( this.renderReply );
		return (
			<div className="reviews__replies">
				{ repliesOutput }

				<ReviewReplyCreate siteId={ siteId } review={ review } />
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const replies = getReviewReplies( state, props.review.id ) || [];
		return {
			siteId,
			replies,
		};
	},
	( dispatch ) => bindActionCreators( { fetchReviewReplies }, dispatch )
)( localize( ReviewReplies ) );

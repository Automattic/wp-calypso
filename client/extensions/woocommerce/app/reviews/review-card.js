/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Gravatar from './gravatar';
import ReviewActionsBar from './review-actions-bar';
import ReviewReplies from './review-replies';
import AutoDirection from 'components/auto-direction';
import Button from 'components/button';
import Card from 'components/card';
import Emojify from 'components/emojify';
import Rating from 'components/rating';
import { stripHTML, decodeEntities } from 'lib/formatting';
import humanDate from 'lib/human-date';

class ReviewCard extends Component {
	static propTypes = {
		review: PropTypes.shape( {
			status: PropTypes.string,
			avatar_urls: PropTypes.object,
			name: PropTypes.string,
			product: PropTypes.shape( {
				image: PropTypes.string,
			} ),
			date_created_gmt: PropTypes.string,
			review: PropTypes.string,
			rating: PropTypes.number,
		} ).isRequired,
		currentStatus: PropTypes.string.isRequired,
	};

	state = {
		isExpanded: false,
	};

	toggleExpanded = () => {
		this.setState( ( { isExpanded } ) => ( { isExpanded: ! isExpanded } ) );
	}

	renderToggle() {
		const { isExpanded } = this.state;
		return (
			<Button
				borderless
				className="reviews__action-collapse"
				onClick={ isExpanded ? this.toggleExpanded : noop }
			>
				<Gridicon icon="chevron-down" />
			</Button>
		);
	}

	renderProductImage() {
		const { review } = this.props;
		const productImageClasses = classNames( 'reviews__product', { 'is-placeholder': ! review.product.image } );
		return (
			<div className={ productImageClasses }>
				{ review.product.image && ( <img src={ review.product.image } /> ) }
			</div>
		);
	}

	renderActionsBar() {
		const { review, currentStatus, siteId } = this.props;
		return (
			<div className={ classNames( 'reviews__header' ) } >
				<ReviewActionsBar
					siteId={ siteId }
					review={ review }
					currentStatus={ currentStatus }
					toggleExpanded={ this.toggleExpanded }
				/>
				{ this.renderToggle() }
			</div>
		);
	}

	renderPreview() {
		const { review } = this.props;
		return (
			<div
				className={ classNames( 'reviews__header', 'is-preview' ) }
				onClick={ this.toggleExpanded }
			>
				<div className="reviews__author-gravatar">
					<Gravatar
						object={ review }
						forType="review"
					/>
				</div>
				<div className="reviews__info">
					<div className="reviews__author-name">
						{ review.name }
						{ review.verified && <Gridicon icon="checkmark-circle" size={ 18 } /> }
					</div>
					<div className="reviews__date">{ humanDate( review.date_created_gmt + 'Z' ) }</div>
				</div>
				<AutoDirection>
					<div className="reviews__content">
						{ decodeEntities( stripHTML( review.review ) ) }
					</div>
				</AutoDirection>
				<div className="reviews__rating">
					<Rating rating={ review.rating * 20 } />
				</div>
				{ this.renderProductImage() }
				{ this.renderToggle() }
			</div>
		);
	}

	renderExpandedCard() {
		const { review, translate } = this.props;
		return (
			<div className="reviews__expanded-card">
				<div className="reviews__expanded-card-details">
					<div className="reviews__author-gravatar">
						<Gravatar
							object={ review }
							forType="review"
						/>
					</div>

					<div className="reviews__info">
						<div className="reviews__author-name">{ review.name }</div>
						<div className="reviews__date">{ humanDate( review.date_created_gmt + 'Z' ) }</div>
					</div>

					{ review.verified && (
						<div className="reviews__verified-label">
							<Gridicon icon="checkmark-circle" size={ 18 } />
							<span>{ translate( 'Verified buyer' ) }</span>
						</div>
					) }

					<div className="reviews__rating">
						<Rating rating={ review.rating * 20 } />
					</div>
					{ this.renderProductImage() }
				</div>

				<AutoDirection>
					<Emojify>
						<div className="reviews__content"
							dangerouslySetInnerHTML={ { __html: review.review } } //eslint-disable-line react/no-danger
							// Also used in `comment-detail/comment-detail-comment.jsx` to set the rendered content correctly
						/>
					</Emojify>
				</AutoDirection>

				<ReviewReplies
					review={ review }
				/>
			</div>
		);
	}

	render() {
		const { review } = this.props;
		const { isExpanded } = this.state;

		const classes = classNames( 'reviews__card', {
			'is-approved': 'approved' === review.status,
			'is-unapproved': 'pending' === review.status,
			'is-expanded': isExpanded,
			'is-collapsed': ! isExpanded,
		} );

		return (
			<Card className={ classes }>
				{ isExpanded && this.renderActionsBar() || this.renderPreview() }
				{ isExpanded && this.renderExpandedCard() }
			</Card>
		);
	}
}

export default localize( ReviewCard );

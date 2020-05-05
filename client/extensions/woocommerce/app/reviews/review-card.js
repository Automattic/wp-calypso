/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import { Button, Card } from '@automattic/components';
import Emojify from 'components/emojify';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Gravatar from './gravatar';
import humanDate from 'lib/human-date';
import Rating from 'components/rating';
import ReviewActionsBar from './review-actions-bar';
import ReviewReplies from './review-replies';
import { stripHTML, decodeEntities } from 'lib/formatting';

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
	};

	renderToggle() {
		const { isExpanded } = this.state;
		const { translate } = this.props;
		return (
			<Button
				borderless
				className="reviews__action-collapse"
				aria-label={ isExpanded ? translate( 'Collapse review' ) : translate( 'Expand review' ) }
				aria-expanded={ isExpanded }
				onClick={ this.toggleExpanded }
			>
				<Gridicon icon="chevron-down" />
			</Button>
		);
	}

	renderActionsBar() {
		const { review, currentStatus, siteId } = this.props;
		return (
			<div className={ classNames( 'reviews__header' ) }>
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
			<div className={ classNames( 'reviews__header', 'is-preview' ) }>
				<div className="reviews__header-content">
					<div className="reviews__author-gravatar">
						<Gravatar object={ review } forType="review" />
					</div>
					<div className="reviews__info">
						<div className="reviews__author-name">
							{ review.name }
							{ review.verified && <Gridicon icon="checkmark-circle" size={ 18 } /> }
						</div>
						<div className="reviews__date">{ humanDate( review.date_created_gmt + 'Z' ) }</div>
					</div>
					<AutoDirection>
						<div className="reviews__content">{ decodeEntities( stripHTML( review.review ) ) }</div>
					</AutoDirection>
					<div className="reviews__rating">
						<Rating rating={ review.rating * 20 } size={ 18 } />
					</div>
				</div>
				{ this.renderToggle() }
			</div>
		);
	}

	renderExpandedCard() {
		const { site, review, translate } = this.props;
		return (
			<div className="reviews__expanded-card">
				<div className="reviews__product-name">
					{ translate( 'Review for {{productLink}}%(productName)s{{/productLink}}.', {
						args: {
							productName: review.product.name,
						},
						components: {
							productLink: (
								<a href={ getLink( `/store/product/:site/${ review.product.id }`, site ) } />
							),
						},
					} ) }
				</div>
				<div className="reviews__expanded-card-details-wrap">
					<div className="reviews__expanded-card-details">
						<div className="reviews__author-gravatar">
							<Gravatar object={ review } forType="review" />
						</div>

						<div className="reviews__info">
							<div className="reviews__author-name">
								{ review.name }
								{ review.verified && (
									<span className="reviews__verified-label">
										<Gridicon icon="checkmark-circle" size={ 18 } />
										<span>{ translate( 'Verified buyer' ) }</span>
									</span>
								) }
							</div>
							<div className="reviews__date">{ humanDate( review.date_created_gmt + 'Z' ) }</div>
						</div>

						<div className="reviews__rating">
							<Rating rating={ review.rating * 20 } size={ 18 } />
						</div>
					</div>

					<AutoDirection>
						<Emojify>
							<div
								className="reviews__content"
								dangerouslySetInnerHTML={ { __html: review.review } } //eslint-disable-line react/no-danger
								// Also used in `comments/comment/comment-content.jsx` to set the rendered content correctly
							/>
						</Emojify>
					</AutoDirection>
				</div>

				<ReviewReplies review={ review } />
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
				{ ( isExpanded && this.renderActionsBar() ) || this.renderPreview() }
				{ isExpanded && this.renderExpandedCard() }
			</Card>
		);
	}
}

export default connect( ( state ) => {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
} )( localize( ReviewCard ) );

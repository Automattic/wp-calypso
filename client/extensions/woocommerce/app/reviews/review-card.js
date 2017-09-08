/**
 * External depedencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import humanDate from 'lib/human-date';
import Rating from 'components/rating';
import { stripHTML, decodeEntities } from 'lib/formatting';

class ReviewCard extends Component {
	static propTypes = {
		review: PropTypes.shape( {
			approved: PropTypes.bool,
			avatar_urls: PropTypes.object,
			name: PropTypes.string,
			product: PropTypes.shape( {
				image: PropTypes.string,
			} ),
			date_created_gmt: PropTypes.string,
			review: PropTypes.string,
			rating: PropTypes.number,
		} ).isRequired,
	};

	render() {
		const { review } = this.props;
		const classes = classNames( 'reviews__card', {
			'is-approved': review.approved,
			'is-unapproved': ! review.approved,
		} );
		const author = {
			avatar_URL: review.avatar_urls[ 48 ],
			display_name: review.name,
		};

		const productImageClasses = classNames( 'reviews__product', { 'is-placeholder': ! review.product.image } );

		return (
			<Card className={ classes }>
				<div className={ classNames( 'reviews__header', 'is-preview' ) } >
					<div className="reviews__author-gravatar">
						<Gravatar user={ author } />
					</div>
					<div className="reviews__info">
						<div className="reviews__author-name">{ review.name }</div>
						<div className="reviews__date">{ humanDate( review.date_created_gmt + 'Z' ) }</div>
					</div>
					<AutoDirection>
						<div className="reviews__content">
							{ decodeEntities( stripHTML( review.review ) ) }
						</div>
					</AutoDirection>
					<div className="reviews__rating">
						<Rating rating={ ( review.rating / 5 ) * 100 } />
					</div>
					<div className={ productImageClasses }>
						{ review.product.image && ( <img src={ review.product.image } /> ) }
					</div>
				</div>
			</Card>
		);
	}
}

export default localize( ReviewCard );

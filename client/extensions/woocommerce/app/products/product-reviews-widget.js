/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Rating from 'components/rating';
import { getLink } from 'woocommerce/lib/nav-utils';

const ProductReviewsWidget = ( { site, product, translate } ) => {
	if ( ! product.rating_count ) {
		return null;
	}

	const reviewLabel = translate(
		'%(reviewCount)d review for %(productName)s',
		'%(reviewCount)d reviews for %(productName)s',
		{
			count: product.rating_count,
			args: {
				reviewCount: product.rating_count,
				productName: product.name,
			},
		}
	);

	return (
		<div className="products__reviews-widget">
			<div className="products__reviews-widget-label">{ translate( 'Reviews' ) }</div>

			<div className="products__reviews-widget-container">
				<Rating rating={ product.average_rating * 20 } size={ 16 } />
				<a href={ getLink( `/store/reviews/${ product.id }/pending/:site`, site ) }>{ reviewLabel }</a>
			</div>
		</div>
	);
};

ProductReviewsWidget.propTypes = {
	site: PropTypes.object,
	product: PropTypes.shape( {
		id: PropTypes.isRequired,
		name: PropTypes.string,
		average_rating: PropTypes.string,
		rating_count: PropTypes.number,
	} ),
};

export default localize( ProductReviewsWidget );

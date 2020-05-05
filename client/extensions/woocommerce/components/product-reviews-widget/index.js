/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Rating from 'components/rating';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

const ProductReviewsWidget = ( { site, product, translate } ) => {
	if ( ! product.rating_count ) {
		return null;
	}

	const reviewLabel = translate(
		'Based on %(reviewCount)d review',
		'Based on %(reviewCount)d reviews',
		{
			count: product.rating_count,
			args: {
				reviewCount: product.rating_count,
			},
		}
	);

	return (
		<div className="product-reviews-widget">
			<div className="product-reviews-widget__label">{ translate( 'Average rating' ) }</div>

			<div className="product-reviews-widget__container">
				<Rating rating={ product.average_rating * 20 } size={ 16 } />
				<a href={ getLink( `/store/reviews/${ product.id }/approved/:site`, site ) }>
					{ reviewLabel }
				</a>
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

export default connect( ( state ) => {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
} )( localize( ProductReviewsWidget ) );

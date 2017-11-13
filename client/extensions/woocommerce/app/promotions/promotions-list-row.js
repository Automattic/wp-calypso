/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

function getPromotionTypeText( promotionType, translate ) {
	switch ( promotionType ) {
		case 'fixed_product':
			return translate( 'Product discount coupon' );
		case 'fixed_cart':
			return translate( 'Cart discount coupon' );
		case 'percent':
			return translate( 'Percent cart discount coupon' );
		case 'product_sale':
			return translate( 'Individual product sale' );
	}
}

function getTimeframeText( promotion, translate, moment ) {
	// TODO: Use humanDate when it supports future dates.

	if ( promotion.startDate && promotion.endDate ) {
		return translate( '%(startDate)s - %(endDate)s', {
			args: {
				startDate: moment( promotion.startDate ).format( 'll' ),
				endDate: moment( promotion.endDate ).format( 'll' ),
			},
		} );
	}
	if ( promotion.endDate ) {
		return translate( 'Ends on %(endDate)s', {
			args: {
				endDate: moment( promotion.endDate ).format( 'll' ),
			},
		} );
	}
	if ( promotion.startDate ) {
		return translate( '%(startDate)s - No end date', {
			args: {
				startDate: moment( promotion.startDate ).format( 'll' ),
			},
		} );
	}
	return translate( 'No end date' );
}

const PromotionsListRow = ( { site, promotion, translate, moment } ) => {
	return (
		<TableRow href={ getLink( '/store/promotion/:site/' + promotion.id, site ) }>
			<TableItem isTitle className="promotions__list-promotion">
				<span className="promotions__list-name">{ promotion.name }</span>
			</TableItem>

			<TableItem>{ getPromotionTypeText( promotion.type, translate ) }</TableItem>

			<TableItem>{ getTimeframeText( promotion, translate, moment ) }</TableItem>
		</TableRow>
	);
};

PromotionsListRow.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	promotion: PropTypes.shape( {} ),
};

export default localize( PromotionsListRow );

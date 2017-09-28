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
		case 'product_sale':
			return translate( 'Product Sale' );
		case 'coupon':
			return translate( 'Coupon' );
	}
}

function getTimeframeText( promotion, moment ) {
	const startText = ( promotion.startDate ? moment( promotion.startDate ).format( 'L' ) : '' );
	const endText = ( promotion.endDate ? moment( promotion.endDate ).format( 'L' ) : '' );

	if ( promotion.startDate && promotion.endDate ) {
		return `${ startText } - ${ endText }`;
	}
	if ( promotion.endDate ) {
		return `ends on ${ endText }`;
	}
	if ( promotion.startDate ) {
		return `${ startText } - ongoing`;
	}
	return 'ongoing';
}

const PromotionsListRow = ( { site, promotion, translate, moment } ) => {
	return (
		// TODO: Replace with individual update link for promotion.
		<TableRow href={ getLink( '/store/promotions/:site', site ) }>
			<TableItem isTitle className="promotions__list-promotion">
				<span className="promotions__list-name">{ promotion.name }</span>
			</TableItem>

			<TableItem>
				<span>{ getPromotionTypeText( promotion.type, translate ) }</span>
			</TableItem>

			<TableItem>
				<span>{ getTimeframeText( promotion, moment ) }</span>
			</TableItem>
		</TableRow>
	);
};

PromotionsListRow.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	promotion: PropTypes.shape( {
	} ),
};

export default localize( PromotionsListRow );


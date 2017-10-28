/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import warn from 'lib/warn';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import promotionModels from './promotion-models';
import { renderField } from './fields';
import SectionHeader from 'components/section-header';

const promotionFieldEdit = ( siteId, promotion, editPromotion ) => ( fieldName, newValue ) => {
	const newPromotion = {
		type: promotion.type, // type always gets set because it's not set when selected.
		[ fieldName ]: newValue,
	};
	editPromotion( siteId, promotion, newPromotion );
};

function renderFields( promotion, edit, translate, currency ) {
	const model = promotionModels[ promotion.type ];

	if ( ! model ) {
		warn( 'No model found for promotion type: ' + promotion.type );
		return null;
	}

	return Object.keys( model ).map( ( fieldName ) => {
		const fieldModel = model[ fieldName ];
		return renderField( fieldName, fieldModel, promotion, edit, currency );
	} );
}

function getHeaderText( promotionType, translate ) {
	switch ( promotionType ) {
		case 'product_sale':
			return translate( 'Product & Sale Price' );
		case 'fixed_product':
		case 'fixed_cart':
		case 'percent':
			return translate( 'Coupon Code & Discount' );
	}
}

const PromotionFormCard = ( {
	siteId,
	currency,
	promotion,
	editPromotion,
	translate
} ) => {
	const edit = promotionFieldEdit( siteId, promotion, editPromotion );

	return (
		<div>
			<SectionHeader label={ getHeaderText( promotion.type, translate ) } />
			<Card className="promotions__promotion-form-card">
				{ renderFields(
					promotion,
					edit,
					translate,
					currency
				) }
			</Card>
		</div>
	);
};

PromotionFormCard.PropTypes = {
	siteId: PropTypes.number.isRequired,
	currency: PropTypes.string.isRequired,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.string.isRequired,
	} ),
	editPromotion: PropTypes.func.isRequired,
};

export default localize( PromotionFormCard );


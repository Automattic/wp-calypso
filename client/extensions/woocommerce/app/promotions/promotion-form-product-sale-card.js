/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PromotionFormDiscountTypeAndAmount from './promotion-form-discount-type-and-amount';
import PromotionFormAppliesTo from './promotion-form-applies-to';

function editProduct( siteId, promotion, product, data, editPromotion ) {
	const newProduct = { ...product, ...data };
	editPromotion( siteId, promotion, { ...promotion, product: newProduct } );
}

const PromotionFormProductSaleCard = ( {
	siteId,
	currency,
	promotion,
	editPromotion,
	products,
	translate,
} ) => {
	const product = ( promotion && promotion.product ) || { sale_price: '' };
	const discountTypesAvailable = [
		{ type: 'price', value: 'flat_discount', text: translate( 'Flat discount' ) },
	];

	const onAmountChange = ( sale_price ) => {
		editProduct( siteId, promotion, product, { sale_price }, editPromotion );
	};

	return (
		<Card className="promotions__promotion-form-product-sale">
			<PromotionFormDiscountTypeAndAmount
				discountTypesAvailable={ discountTypesAvailable }
				discountTypeValue={ 'flat_discount' }
				amount={ product.sale_price }
				currency={ currency }
				onDiscountTypeSelect={ noop }
				onAmountChange={ onAmountChange }
			/>
			<PromotionFormAppliesTo
				siteId={ siteId }
				promotion={ promotion }
				editPromotion={ editPromotion }
				products={ products }
			/>
		</Card>
	);
};

PromotionFormProductSaleCard.PropTypes = {
	siteId: PropTypes.number,
	currency: PropTypes.string,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
		code: PropTypes.string,
		discount_type: PropTypes.string,
		amount: PropTypes.number,
	} ),
	editPromotion: PropTypes.func.isRequired,
	products: PropTypes.array,
};

export default localize( PromotionFormProductSaleCard );

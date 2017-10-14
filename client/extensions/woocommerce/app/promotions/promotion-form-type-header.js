/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import FormSelect from 'components/forms/form-select';

const PromotionFormTypeHeader = ( {
	siteId,
	promotion,
	editPromotion,
	translate,
} ) => {
	const promotionType = ( promotion && promotion.type ? promotion.type : '' );

	const onTypeSelect = ( e ) => {
		const type = e.target.value;
		editPromotion( siteId, promotion, { type } );
	};

	return (
		<SectionHeader label={ translate( 'Promotion type' ) } className="promotions__promotion-form-type-header">
			<FormSelect value={ promotionType } onChange={ onTypeSelect }>
				<option value="product_sale">{ translate( 'Individual Product Sale' ) }</option>
				<option value="fixed_product">{ translate( 'Product Discount' ) }</option>
				<option value="fixed_cart">{ translate( 'Cart Discount' ) }</option>
				<option value="percent">{ translate( 'Percent Cart Discount' ) }</option>
			</FormSelect>
		</SectionHeader>
	);
};

PromotionFormTypeHeader.PropTypes = {
	siteId: PropTypes.number,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.string.isRequired,
	} ),
	editPromotion: PropTypes.func.isRequired,
};

export default localize( PromotionFormTypeHeader );


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

const PromotionFormTypeCard = ( {
	siteId,
	promotion,
	editPromotion,
	translate,
} ) => {
	const promotionType = ( promotion && promotion.type ? promotion.type : '' );

	const onTypeSelect = ( e ) => {
		const data = { type: e.target.value };
		if ( 'coupon' === data.type ) {
			data.coupon = { code: '', discount_type: 'percent', amount: '' };
			data.product = undefined;
		}
		if ( 'product_sale' === data.type ) {
			data.product = {};
			data.coupon = undefined;
		}
		editPromotion( siteId, promotion, data );
	};

	return (
		<SectionHeader label={ translate( 'Promotion type' ) } className="promotions__promotion-form-type-header">
			<FormSelect value={ promotionType } onChange={ onTypeSelect }>
				<option value="" disabled>{ translate( 'Select promotion type…' ) }</option>
				<option value="coupon">{ translate( 'Coupon' ) }</option>
				<option value="product_sale">{ translate( 'Product Sale' ) }</option>
			</FormSelect>
		</SectionHeader>
	);
};

PromotionFormTypeCard.PropTypes = {
	siteId: PropTypes.number,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
	} ),
	editPromotion: PropTypes.func.isRequired,
};

export default localize( PromotionFormTypeCard );


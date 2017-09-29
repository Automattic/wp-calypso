/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';

const PromotionFormTypeCard = ( {
	siteId,
	promotion,
	editPromotion,
	translate,
} ) => {
	const promotionType = ( promotion && promotion.type ? promotion.type : '' );

	const onTypeSelect = ( e ) => {
		editPromotion( siteId, promotion, { type: e.target.value } );
	};

	return (
		<Card className="promotions__promotion-form-type">
			<FormFieldset className="promotions__promotion-form-type-select">
				<FormLabel>{ translate( 'Promotion type' ) }</FormLabel>
				<FormSelect value={ promotionType } onChange={ onTypeSelect }>
					<option value="" disabled>{ translate( 'Select promotion type…' ) }</option>
					<option value="coupon">{ translate( 'Coupon' ) }</option>
					<option value="product_sale">{ translate( 'Product Sale' ) }</option>
				</FormSelect>
			</FormFieldset>
		</Card>
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


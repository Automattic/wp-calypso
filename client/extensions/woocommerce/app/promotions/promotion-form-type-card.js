/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import SectionHeader from 'components/section-header';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

function getExplanation( promotionType, translate ) {
	switch ( promotionType ) {
		case 'product_sale':
			return translate( 'Place a single product on sale for all customers.' );
		case 'fixed_product':
			return translate( 'Issue a coupon with a discount for one or more products.' );
		case 'fixed_cart':
			return translate( 'Issue a coupon with a discount for the entire cart amount.' );
		case 'percent':
			return translate( 'Issue a coupon with a percentage discount for the entire cart.' );
		case 'free_shipping':
			return translate( 'Issue a free shipping coupon.' );
	}
}

const PromotionFormTypeCard = ( { siteId, promotion, editPromotion, translate } ) => {
	const promotionType = promotion && promotion.type ? promotion.type : '';

	const productTypesDisabled = Boolean( promotion.couponId );
	const couponTypesDisabled = Boolean( promotion.productId );

	const onTypeSelect = ( e ) => {
		const type = e.target.value;
		editPromotion( siteId, promotion, { type } );
	};

	return (
		<div>
			<SectionHeader label={ translate( 'Promotion type' ) } />
			<Card className="promotions__promotion-form-type-card">
				<FormSelect value={ promotionType } onChange={ onTypeSelect }>
					<option value="fixed_product" disabled={ couponTypesDisabled }>
						{ translate( 'Product discount coupon' ) }
					</option>
					<option value="fixed_cart" disabled={ couponTypesDisabled }>
						{ translate( 'Cart discount coupon' ) }
					</option>
					<option value="percent" disabled={ couponTypesDisabled }>
						{ translate( 'Percent cart discount coupon' ) }
					</option>
					<option value="free_shipping" disabled={ couponTypesDisabled }>
						{ translate( 'Free shipping' ) }
					</option>
					<option value="product_sale" disabled={ productTypesDisabled }>
						{ translate( 'Individual product sale' ) }
					</option>
				</FormSelect>
				<FormSettingExplanation>
					{ getExplanation( promotionType, translate ) }
				</FormSettingExplanation>
			</Card>
		</div>
	);
};

PromotionFormTypeCard.propTypes = {
	siteId: PropTypes.number,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.oneOf( [
			'product_sale',
			'fixed_product',
			'fixed_cart',
			'percent',
			'free_shipping',
		] ).isRequired,
	} ),
	editPromotion: PropTypes.func.isRequired,
};

export default localize( PromotionFormTypeCard );

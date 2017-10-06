/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PromotionFormTypeHeader from './promotion-form-type-header';
import PromotionFormCouponCard from './promotion-form-coupon-card';
import PromotionFormProductSaleCard from './promotion-form-product-sale-card';
import PromotionFormConditionsHeader from './promotion-form-conditions-header';
import PromotionFormConditionsCard from './promotion-form-conditions-card';

function renderPlaceholder() {
	const { className } = this.props;
	return (
		<div className={ classNames( 'promotions__form', 'is-placeholder', className ) }>
			<div></div>
			<div></div>
			<div></div>
		</div>
	);
}

const editRenderers = {
	coupon: renderCouponEdit,
	product_sale: renderProductSaleEdit,
};

function renderCouponEdit( siteId, currency, promotion, editPromotion, products, productCategories ) {
	return (
		<PromotionFormCouponCard
			siteId={ siteId }
			promotion={ promotion }
			editPromotion={ editPromotion }
			products={ products }
			productCategories={ productCategories }
		/>
	);
}

function renderProductSaleEdit( siteId, currency, promotion, editPromotion, products ) {
	return (
		<PromotionFormProductSaleCard
			siteId={ siteId }
			promotion={ promotion }
			editPromotion={ editPromotion }
			products={ products }
		/>
	);
}

function renderEdit( siteId, currency, promotion, editPromotion, products, productCategories ) {
	if ( ! promotion || ! promotion.type ) {
		return null;
	}

	const renderer = editRenderers[ promotion.type ];
	return renderer && renderer( siteId, currency, promotion, editPromotion, products, productCategories );
}

function renderConditionsHeader( promotion ) {
	if ( ! promotion || ! promotion.type ) {
		return null;
	}

	return (
		<PromotionFormConditionsHeader />
	);
}

function renderConditionsCard( siteId, promotion, editPromotion, currency ) {
	if ( ! promotion || ! promotion.type ) {
		return null;
	}

	return (
		<PromotionFormConditionsCard
			siteId={ siteId }
			promotion={ promotion }
			editPromotion={ editPromotion }
			currency={ currency }
		/>
	);
}

export default class PromotionForm extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		siteId: PropTypes.number,
		currency: PropTypes.string,
		promotion: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editPromotion: PropTypes.func.isRequired,
		products: PropTypes.array,
		productCategories: PropTypes.array,
	};

	render() {
		const { siteId, currency, promotion, editPromotion, products, productCategories } = this.props;

		if ( ! siteId ) {
			return renderPlaceholder();
		}

		return (
			<div className={ classNames( 'promotions__form', this.props.className ) }>
				<PromotionFormTypeHeader
					siteId={ siteId }
					promotion={ promotion }
					editPromotion={ editPromotion }
				/>
				{ renderEdit( siteId, currency, promotion, editPromotion, products, productCategories ) }
				{ renderConditionsHeader( promotion ) }
				{ renderConditionsCard( siteId, promotion, editPromotion, currency ) }
			</div>
		);
	}
}


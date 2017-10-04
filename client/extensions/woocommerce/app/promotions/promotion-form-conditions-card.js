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
import DatePicker from 'components/date-picker';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import PriceInput from 'woocommerce/components/price-input';

function editPromotionCoupon( siteId, promotion, data, editPromotion ) {
	const coupon = promotion.coupon || {};
	const newCoupon = { ...coupon, ...data };
	editPromotion( siteId, promotion, { ...promotion, coupon: newCoupon } );
}

function editPromotionProduct( siteId, promotion, data, editPromotion ) {
	const product = promotion.product || {};
	const newProduct = { ...product, ...data };
	editPromotion( siteId, promotion, { ...promotion, product: newProduct } );
}

const minMaxSpend = {
	name: 'minMaxSpend',
	getText: ( translate ) => translate( 'Minimum / Maximum spend' ),
	isChecked: ( promotion ) => {
		const { minimum_amount, maximum_amount } = promotion.coupon || {};
		const hasMin = 'undefined' !== typeof minimum_amount;
		const hasMax = 'undefined' !== typeof maximum_amount;
		return hasMin || hasMax;
	},
	setChecked: ( checked, promotion, siteId, editPromotion ) => {
		const minimum_amount = ( checked ? '' : undefined );
		const maximum_amount = ( checked ? '' : undefined );
		editPromotionCoupon( siteId, promotion, { minimum_amount, maximum_amount }, editPromotion );
	},
	renderEdit: ( promotion, currency, translate, onChange ) => {
		const { minimum_amount, maximum_amount } = promotion.coupon;

		const minAmount =
			<PriceInput
				name="minimum_amount"
				value={ minimum_amount }
				currency={ currency }
				onChange={ onChange }
			/>;

		const maxAmount =
			<PriceInput
				name="maximum_amount"
				value={ maximum_amount }
				currency={ currency }
				onChange={ onChange }
			/>;

		return (
			<div className="promotions__promotion-form-condition-minmaxspend">
				{
					translate( '{{minAmount/}} to {{maxAmount/}}', {
						components: { minAmount, maxAmount }
					} )
				}
			</div>
		);
	},
};

const expiryDate = {
	name: 'expiryDate',
	getText: ( translate ) => translate( 'Expiry date' ),
	isChecked: ( promotion ) => {
		const { date_expires_gmt } = promotion.coupon || {};
		return 'undefined' !== typeof date_expires_gmt;
	},
	setChecked: ( checked, promotion, siteId, editPromotion ) => {
		const date_expires_gmt = ( checked ? new Date().toISOString() : undefined );
		editPromotionCoupon( siteId, promotion, { date_expires_gmt }, editPromotion );
	},
	renderEdit: ( promotion, currency, translate, onChange ) => {
		const { date_expires_gmt } = promotion.coupon;
		const date = new Date( date_expires_gmt );

		const onSelectDay = ( day ) => onChange( { target: { name: 'date_expires_gmt', value: day } } );

		return (
			<div className="promotions__promotion-form-condition-expirydate">
				<DatePicker
					initialMonth={ date }
					selectedDay={ date }
					onSelectDay={ onSelectDay }
				/>
			</div>
		);
	},
};

const dateRange = {
	name: 'dateRange',
	getText: ( translate ) => translate( 'Date range' ),
	isChecked: ( promotion ) => {
		const { date_on_sale_from_gmt, date_on_sale_to_gmt } = promotion.product || {};
		const hasStartDate = 'undefined' !== typeof date_on_sale_from_gmt;
		const hasEndDate = 'undefined' !== typeof date_on_sale_to_gmt;
		return hasStartDate || hasEndDate;
	},
	setChecked: ( checked, promotion, siteId, editPromotion ) => {
		const date_on_sale_from_gmt = ( checked ? new Date().toISOString() : undefined );
		const date_on_sale_to_gmt = ( checked ? new Date().toISOString() : undefined );
		editPromotionProduct( siteId, promotion, { date_on_sale_from_gmt, date_on_sale_to_gmt }, editPromotion );
	},
	renderEdit: ( promotion, currency, translate, onChange ) => {
		const { date_on_sale_from_gmt, date_on_sale_to_gmt } = promotion.product;
		const startDate = new Date( date_on_sale_from_gmt );
		const endDate = new Date( date_on_sale_to_gmt );

		const onSelectStartDay = ( day ) => onChange( { target: { name: 'date_on_sale_from_gmt', value: day } } );
		const onSelectEndDay = ( day ) => onChange( { target: { name: 'date_on_sale_to_gmt', value: day } } );

		return (
			<div className="promotions__promotion-form-condition-daterange">
				<DatePicker
					initialMonth={ startDate }
					selectedDay={ startDate }
					onSelectDay={ onSelectStartDay }
				/>
				<DatePicker
					initialMonth={ endDate }
					selectedDay={ endDate }
					onSelectDay={ onSelectEndDay }
				/>
			</div>
		);
	},
};

const otherCoupons = {
	name: 'otherCoupons',
	getText: ( translate ) => translate( 'Can be applied in conjunction with other coupons' ),
	isChecked: ( promotion ) => {
		const { individual_use } = promotion.coupon || {};
		return individual_use || false;
	},
	setChecked: ( checked, promotion, siteId, editPromotion ) => {
		const individual_use = checked;
		editPromotionCoupon( siteId, promotion, { individual_use }, editPromotion );
	},
	renderEdit: noop,
};

const allowWithSale = {
	name: 'allowWithSale',
	getText: ( translate ) => translate( 'Can be applied to products on sale' ),
	isChecked: ( promotion ) => {
		const { exclude_sale_items } = promotion.coupon || {};
		if ( 'undefined' === typeof exclude_sale_items ) {
			// If it wasn't set before, default to false.
			return false;
		}
		return ! exclude_sale_items;
	},
	setChecked: ( checked, promotion, siteId, editPromotion ) => {
		const exclude_sale_items = ! checked;
		editPromotionCoupon( siteId, promotion, { exclude_sale_items }, editPromotion );
	},
	renderEdit: noop,
};

const changeValues = {
	minimum_amount: ( value, promotion, siteId, editPromotion ) => {
		editPromotionCoupon( siteId, promotion, { minimum_amount: value }, editPromotion );
	},
	maximum_amount: ( value, promotion, siteId, editPromotion ) => {
		editPromotionCoupon( siteId, promotion, { maximum_amount: value }, editPromotion );
	},
	date_expires_gmt: ( value, promotion, siteId, editPromotion ) => {
		editPromotionCoupon( siteId, promotion, { date_expires_gmt: value }, editPromotion );
	},
	date_on_sale_from_gmt: ( value, promotion, siteId, editPromotion ) => {
		editPromotionProduct( siteId, promotion, { date_on_sale_from_gmt: value }, editPromotion );
	},
	date_on_sale_to_gmt: ( value, promotion, siteId, editPromotion ) => {
		editPromotionProduct( siteId, promotion, { date_on_sale_to_gmt: value }, editPromotion );
	},
};

const couponConditions = {
	minMaxSpend,
	expiryDate,
	otherCoupons,
	allowWithSale,
};

const productSaleConditions = {
	dateRange,
};

function renderCondition( promotion, condition, currency, translate, onCheck, onChange ) {
	return (
		<FormFieldset key={ condition.name } className="promotions__promotion-form-condition">
			<FormInputCheckbox checked={ condition.isChecked( promotion ) } value={ condition.name } onChange={ onCheck } />
			<FormLabel>{ condition.getText( translate ) }</FormLabel>
			{ condition.isChecked( promotion ) && condition.renderEdit( promotion, currency, translate, onChange ) }
		</FormFieldset>
	);
}

function getConditions( promotion ) {
	switch ( promotion.type ) {
		case 'coupon':
			return couponConditions;
		case 'product_sale':
			return productSaleConditions;
		default:
			return {};
	}
}

const PromotionFormConditionsCard = ( {
	siteId,
	promotion,
	editPromotion,
	currency,
	translate,
} ) => {
	const conditions = getConditions( promotion );

	const onCheck = ( e ) => {
		const conditionName = e.target.value;
		const condition = conditions[ conditionName ];
		condition.setChecked( ! condition.isChecked( promotion ), promotion, siteId, editPromotion );
	};

	const onChange = ( e ) => {
		const name = e.target.name;
		const value = e.target.value;
		changeValues[ name ]( value, promotion, siteId, editPromotion );
	};

	const conditionRows = Object.keys( conditions ).map( ( key ) => {
		return renderCondition( promotion, conditions[ key ], currency, translate, onCheck, onChange );
	} );

	return (
		<Card className="promotions__promotion-form-conditions">
			{ conditionRows }
		</Card>
	);
};

PromotionFormConditionsCard.PropTypes = {
	siteId: PropTypes.number,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
	} ),
	editPromotion: PropTypes.func.isRequired,
	currency: PropTypes.string,
};

export default localize( PromotionFormConditionsCard );


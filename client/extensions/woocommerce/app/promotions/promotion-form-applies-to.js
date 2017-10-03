/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormRadio from 'components/forms/form-radio';

function calculateAppliesTo( promotion ) {
	if ( promotion.appliesTo ) {
		return promotion.appliesTo;
	}

	// This promotion hasn't been edited yet,
	// so we have to figure out what it applies to.
	switch ( promotion.type ) {
		case 'coupon':
			const coupon = promotion.coupon || {};
			if ( coupon.product_ids && coupon.product_ids.length > 0 ) {
				return 'products';
			}
			if ( coupon.product_categories && coupon.product_categories > 0 ) {
				return 'product_categories';
			}
			return 'all_products';
		case 'product_sale':
			return 'one_product';
		default:
			return null;
	}
}

function calculateAvailableSelections( promotion, translate ) {
	const allProducts = { value: 'all_products', text: translate( 'All products' ) };
	const oneProduct = { value: 'one_product', text: translate( 'Specific product' ) };
	const products = { value: 'products', text: translate( 'Products' ) };
	const productCategories = { value: 'product_categories', text: translate( 'Product Categories' ) };

	switch ( promotion.type ) {
		case 'coupon':
			return [ allProducts, products, productCategories ];
		case 'product_sale':
			return [ oneProduct ];
		default:
			return [];
	}
}

function renderSelectionOption( selection ) {
	return ( <option key={ selection.value } value={ selection.value }>{ selection.text }</option> );
}

function isProductSelected( appliesTo, promotion, productId ) {
	switch ( appliesTo ) {
		case 'all_products':
			return true;
		case 'one_product':
			const product = promotion.product || {};
			return productId === product.id;
		case 'products':
			const coupon = promotion.coupon || {};
			const productIds = coupon.product_ids || [];
			return productIds.indexOf( productId ) >= 0;
		case 'product_categories':
			// TODO: Maybe check product's categories in the future?
			return false;
		default:
			return false;
	}
}

function isProductCategorySelected( promotion, productCategoryId ) {
	const coupon = promotion.coupon || {};
	const productCategoryIds = coupon.product_categories || [];
	return productCategoryIds.indexOf( productCategoryId ) >= 0;
}

const renderProductCheckboxRow = ( appliesTo, promotion, onChange ) => ( product ) => {
	const checked = isProductSelected( appliesTo, promotion, product.id );
	return (
		<div key={ product.id }>
			<FormInputCheckbox value={ product.id } checked={ checked } onChange={ onChange } />
			<FormLabel>{ product.name }</FormLabel>
		</div>
	);
};

const renderProductRadioRow = ( appliesTo, promotion, onChange ) => ( product ) => {
	const checked = isProductSelected( appliesTo, promotion, product.id );
	return (
		<div key={ product.id }>
			<FormRadio value={ product.id } checked={ checked } onChange={ onChange } />
			<FormLabel>{ product.name }</FormLabel>
		</div>
	);
};

const renderProductCategoryCheckboxRow = ( promotion, onChange ) => ( category ) => {
	const checked = isProductCategorySelected( promotion, category.id );
	return (
		<div key={ category.id }>
			<FormInputCheckbox value={ category.id } checked={ checked } onChange={ onChange } />
			<FormLabel>{ category.name }</FormLabel>
		</div>
	);
};

function renderProductList( appliesTo, products, productCategories, promotion, onProductChange, onCategoryChange ) {
	switch ( appliesTo ) {
		case 'products':
			const renderProductCheckbox = renderProductCheckboxRow( appliesTo, promotion, onProductChange );
			return (
				<div className="promotions__promotion-form-applies-to-products" >
					{ products.map( renderProductCheckbox ) }
				</div>
			);
		case 'product_categories':
			const renderCategoryCheckbox = renderProductCategoryCheckboxRow( promotion, onCategoryChange );
			return (
				<div className="promotions__promotion-form-applies-to-product-categories" >
					{ productCategories.map( renderCategoryCheckbox ) }
				</div>
			);
		case 'one_product':
			const renderProductRadio = renderProductRadioRow( appliesTo, promotion, onProductChange );
			return (
				<div className="promotions__promotion-form-applies-to-one-product" >
					{ products.map( renderProductRadio ) }
				</div>
			);
		default:
			return null;

	}
}

const PromotionFormAppliesTo = ( {
	siteId,
	promotion,
	editPromotion,
	products,
	productCategories,
	translate,
} ) => {
	const selections = calculateAvailableSelections( promotion, translate );
	const appliesTo = calculateAppliesTo( promotion );

	const onSelect = ( e ) => {
		const data = { appliesTo: e.target.value };
		if ( promotion.coupon ) {
			// Strip out any existing product or category ids when we change mode.
			const { product_ids, product_categories, ...newCoupon } = promotion.coupon; // eslint-disable-line no-unused-vars
			data.coupon = newCoupon;
		}
		editPromotion( siteId, promotion, data );
	};

	const onProductCheck = ( e ) => {
		const productId = Number( e.target.value );

		if ( 'coupon' === promotion.type ) {
			const coupon = promotion.coupon || {};
			const productIds = coupon.product_ids || [];
			const isSelected = isProductSelected( appliesTo, promotion, productId );
			let newProductIds;
			if ( isSelected ) {
				newProductIds = productIds.filter( ( id ) => id !== productId );
			} else {
				newProductIds = [ ...productIds, productId ];
			}
			const newCoupon = { ...coupon, product_ids: newProductIds };
			editPromotion( siteId, promotion, { coupon: newCoupon } );
		}

		if ( 'product_sale' === promotion.type ) {
			const product = find( products, ( p ) => productId === p.id );
			editPromotion( siteId, promotion, { product } );
		}
	};

	const onCategoryCheck = ( e ) => {
		const categoryId = Number( e.target.value );
		const coupon = promotion.coupon || {};
		const categoryIds = coupon.product_categories || [];
		const isSelected = isProductCategorySelected( promotion, categoryId );
		let newCategoryIds;
		if ( isSelected ) {
			newCategoryIds = categoryIds.filter( ( id ) => id !== categoryId );
		} else {
			newCategoryIds = [ ...categoryIds, categoryId ];
		}
		const newCoupon = { ...coupon, product_categories: newCategoryIds };
		editPromotion( siteId, promotion, { coupon: newCoupon } );
	};

	return (
		<FormFieldset className="promotions__promotion-form-applies-to">
			<FormLabel>{ translate( 'Applies to' ) }</FormLabel>
			<FormSelect value={ appliesTo } onChange={ onSelect } >
				{ selections.map( renderSelectionOption ) }
			</FormSelect>
			{ renderProductList( appliesTo, products, productCategories, promotion, onProductCheck, onCategoryCheck ) }
		</FormFieldset>
	);
};

PromotionFormAppliesTo.PropTypes = {
	siteId: PropTypes.number,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
	} ),
	editPromotion: PropTypes.func.isRequired,
	products: PropTypes.array,
	productCategories: PropTypes.array,
};

export default localize( PromotionFormAppliesTo );


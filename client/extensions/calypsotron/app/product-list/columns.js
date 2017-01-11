/**
 * External dependencies
 */
import React from 'react';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import * as cell from './cell-render';
import ColumnSelectIcon from './column-select-icon';

// Custom cell render functions.
const TAX_STATUS_NAMES = {
	taxable: __( 'Taxable' ),
	shipping: __( 'Shipping only' ),
	none: __( 'None' ),
};

const columnGroups = [
	{
		name: __( 'General' ),
		selections: [
			{ key: 'sku',	title: __( 'SKU' ) },
			{
				key: 'dimensions', title: __( 'Dimensions' ),
				columnKeys: [ 'length', 'width', 'height' ]
			},
			{ key: 'weight', title: __( 'Weight' ) },
			{ key: 'price', title: __( 'Current Price' ) },
			{ key: 'regular_price', title: __( 'Regular Price' ) },
			{ key: 'sale_price', title: __( 'Sale Price' ) },
		],
	},
	{
		name: __( 'Inventory' ),
		selections: [
			{ key: 'in_stock', title: __( 'Stock' ) },
			{ key: 'manage_stock', title: __( 'Manage Stock' ) },
			{ key: 'stock_quantity', title: __( 'Stock Quantity' ) },
			{ key: 'shipping_class', title: __( 'Shipping Class' ) },
		],
	},
	{
		name: __( 'Tax' ),
		selections: [
			{ key: 'tax_status', title: __( 'Tax status' ) },
			{ key: 'tax_class', title: __( 'Tax class' ) },
		],
	},
	{
		name: __( 'Organization' ),
		selections: [
			{ key: 'categories', title: __( 'Categories' ) },
			{ key: 'tags', title: __( 'Tags' ) },
		],
	},
	{
		name: __( 'Exposure' ),
		selections: [
			{ key: 'catalog_visibility', title: __( 'Visibility' ) },
			{ key: 'featured', title: __( 'Featured' ) },
		],
	},
	{
		name: __( 'Misc' ),
		selections: [
			{ key: 'backorders', title: __( 'Backorders' ) },
			{ key: 'sold_individually', title: __( 'Sold individually' ) },
		],
	},
];

// Column table for products: Index order matters!!
export default [
	{
		key: 'name',
		title: __( 'Name' ),
		renderView: cell.renderString,
		renderEdit: cell.renderTextInput,
	},
	{
		key: 'sku',
		title: __( 'SKU' ),
		renderView: cell.renderString,
		renderEdit: cell.renderTextInput,
	},
	{
		key: 'length',
		title: __( 'L' ),
		renderView: ( product ) => {
			const value = product.dimensions || {};
			return value.length ? Number( value.length ) : '';
		},
	},
	{
		key: 'width',
		title: __( 'W' ),
		renderView: ( product ) => {
			const value = product.dimensions || {};
			return value.width ? Number( value.width ) : '';
		},
	},
	{
		key: 'height',
		title: __( 'H' ),
		renderView: ( product ) => {
			const value = product.dimensions || {};
			return value.height ? Number( value.height ) : '';
		},
	},
	{
		key: 'weight',
		title: __( 'Weight' ),
		renderView: cell.renderString,
		renderEdit: cell.renderNumberInput,
		constraints: {
			min: 0,
			max: 1000000
		},
	},
	{
		key: 'price',
		title: __( 'Price' ),
		renderView: cell.renderCurrency,
	},
	{
		key: 'regular_price',
		title: __( 'Regular Price' ),
		renderView: cell.renderCurrency,
		renderEdit: cell.renderCurrencyInput,
	},
	{
		key: 'sale_price',
		title: __( 'Sale Price' ),
		renderView: cell.renderCurrency,
		renderEdit: cell.renderCurrencyInput,
	},
	{
		key: 'in_stock',
		title: __( 'Stock' ),
		renderView: cell.renderBoolean,
		renderEdit: cell.renderCheckboxInput,
	},
	{
		key: 'manage_stock',
		title: __( 'Manage stock' ),
		renderView: cell.renderBoolean,
		renderEdit: cell.renderCheckboxInput,
	},
	{
		key: 'stock_quantity',
		title: __( 'Stock quantity' ),
		renderView: cell.renderInteger,
		renderEdit: cell.renderNumberInput,
		constraints: {
			min: 0,
			max: 1000000000000
		},
	},
	{
		key: 'shipping_class',
		title: __( 'Shipping class' ),
		renderView: cell.renderString,
	},
	{
		key: 'tax_status',
		title: __( 'Tax status' ),
		group: __( 'Tax' ),
		renderView: ( product, key ) => {
			return TAX_STATUS_NAMES[ product[ key ] ];
		},
		renderEdit: cell.renderSelectInput,
		constraints: {
			getOptions: () => {
				const options = Object.keys( TAX_STATUS_NAMES ).map( ( value ) => {
					return { name: TAX_STATUS_NAMES[ value ], value };
				} );
				return options;
			}
		},
	},
	{
		key: 'tax_class',
		title: __( 'Tax class' ),
		group: __( 'Tax' ),
		renderView: ( product, key, constraints, helpers ) => {
			// If it's blank, it should show the first tax class from the list.

			const value = product[ key ];
			const taxClassResult = helpers.data.taxClasses.find( ( taxClass, index ) => {
				if ( value === taxClass.slug || 0 === value.length && 0 === index ) {
					return taxClass;
				}
			} );

			return ( taxClassResult ? taxClassResult.name : '' );
		},
		renderEdit: cell.renderSelectInput,
		constraints: {
			getOptions: ( product, key, helpers ) => {
				return helpers.data.taxClasses.map( ( taxClass ) => {
					return {
						name: taxClass.name,
						value: taxClass.slug,
					};
				} );
			},
		},
	},
	{
		key: 'categories',
		title: __( 'Categories' ),
		renderView: cell.renderCategories,
		renderEdit: cell.renderTokenField,
		constraints: {
			inConvert: ( categories ) => {
				return categories.map( ( category ) => {
					return category.name;
				} );
			},
			outConvert: ( names, helpers ) => {
				// Reject any names that aren't in categories already.
				// This keeps people from entering values that aren't valid
				return helpers.data.categories.filter( ( category ) => {
					if ( names.includes( category.name ) ) {
						return category.name;
					}
				} );
			},
			getSuggestions: ( product, key, helpers ) => {
				return helpers.data.categories.map( ( category ) => {
					return category.name;
				} );
			}
		}
	},
	{
		key: 'tags',
		title: __( 'Tags' ),
		renderView: cell.renderTags,
	},
	{
		key: 'catalog_visibility',
		title: __( 'Visibility' ),
		renderView: cell.renderBoolean,
		renderEdit: cell.renderCheckboxInput,
		constraints: {
			trueValue: 'visible',
			falseValue: '',
			trueValues: [ 'visible' ],
		}
	},
	{
		key: 'featured',
		title: __( 'Featured' ),
		renderView: cell.renderBoolean,
		renderEdit: cell.renderCheckboxInput,
		constraints: {
			trueIcon: 'heart',
			falseIcon: null,
		},
	},
	{
		key: 'backorders',
		title: __( 'Backorders' ),
		renderView: cell.renderBoolean,
		renderEdit: cell.renderCheckboxInput,
	},
	{
		key: 'sold_individually',
		title: __( 'Sold invidivually' ),
		renderView: cell.renderBoolean,
		renderEdit: cell.renderCheckboxInput,
	},
	{
		key: 'action',
		title: ( props ) => <ColumnSelectIcon { ...props } columnGroups={ columnGroups } />,
	},
];

export const defaultColumnSelections = {
	name: { key: 'name' },
	price: { key: 'price' },
	stock_quantity: { key: 'stock_quantity' },
	action: { key: 'action' },
};

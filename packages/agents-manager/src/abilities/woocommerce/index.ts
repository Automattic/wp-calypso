/**
 * TEMPORARY (AM-110): WooCommerce abilities until WooCommerce AI is installed on
 * Dotcom stores. WooCommerce AI owns these abilities, so this provider only runs
 * where its provider hasn't loaded.
 *
 * TODO: Remove once WooCommerce AI runs on Dotcom stores: delete this folder, its
 * check in `loadExternalProviders()` and the mock in that function's test.
 */

import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { errorResult, successResult } from '../ability-result';
import { executeAbilityFromList } from '../execute-ability';
import type { ToolProvider } from '../../extension-types';
import type { Ability } from '@wordpress/abilities';

type Args = Record< string, unknown >;

interface WooAbility {
	name: string;
	description: string;
	/** A `wc/v3` path; `{key}` takes the ID argument of that name. */
	path: string;
	method?: 'POST' | 'PUT';
	properties: Args;
	required?: string[];
	defaults?: Args;
	/** Trims what `_fields` can't, before the agent sees the response. */
	transform?: ( response: Args ) => Args;
}

const ID = { type: 'integer', minimum: 1 };
const IDS = { type: 'array', items: { type: 'object', properties: { id: ID } } };
const PRODUCT = {
	name: { type: 'string' },
	regular_price: { type: 'string' },
	sale_price: { type: 'string' },
	description: { type: 'string' },
	short_description: { type: 'string' },
	status: { type: 'string', enum: [ 'draft', 'pending', 'private', 'publish' ] },
	sku: { type: 'string' },
	manage_stock: { type: 'boolean' },
	stock_quantity: { type: 'integer' },
	categories: IDS,
	tags: IDS,
};

// `_fields` keeps responses small, and leaves the customer's name, email, phone
// and address out of orders. It can't filter inside a list, such as `line_items`.
const PRODUCT_FIELDS =
	'id,name,status,type,sku,price,regular_price,sale_price,stock_status,stock_quantity,categories,tags,permalink';
const ORDER_FIELDS =
	'id,number,status,currency,total,customer_id,date_created,date_modified,line_items,billing.state,billing.country,shipping.state,shipping.country';

const WOO_ABILITIES: WooAbility[] = [
	{
		name: 'woocommerce/get-order',
		description: 'Get a WooCommerce order by ID, without customer contact details.',
		path: `/wc/v3/orders/{order_id}?_fields=${ ORDER_FIELDS }`,
		properties: { order_id: ID },
		required: [ 'order_id' ],
		// A line item's `meta_data` can hold details the customer entered, such as add-on fields.
		transform: ( { line_items: lineItems, ...order } ) => ( {
			...order,
			line_items: ( lineItems as Args[] | undefined )?.map(
				( { id, name, product_id, quantity, subtotal, total, sku } ) => ( {
					id,
					name,
					product_id,
					quantity,
					subtotal,
					total,
					sku,
				} )
			),
		} ),
	},
	{
		name: 'woocommerce/search-products',
		description: 'Search WooCommerce products by text or exact SKU, e.g. to find a product ID.',
		path: `/wc/v3/products?_fields=${ PRODUCT_FIELDS }`,
		properties: { search: { type: 'string' }, sku: { type: 'string' }, per_page: ID },
	},
	{
		name: 'woocommerce/create-product',
		description: 'Create a simple WooCommerce product, as a draft unless a status is given.',
		path: `/wc/v3/products?_fields=${ PRODUCT_FIELDS }`,
		method: 'POST',
		properties: PRODUCT,
		required: [ 'name', 'regular_price' ],
		defaults: { status: 'draft' },
	},
	{
		name: 'woocommerce/update-product',
		description: 'Update a WooCommerce product by ID. Pass only the fields to change.',
		path: `/wc/v3/products/{product_id}?_fields=${ PRODUCT_FIELDS }`,
		method: 'PUT',
		properties: { product_id: ID, ...PRODUCT },
		required: [ 'product_id' ],
	},
	{
		name: 'woocommerce/create-product-category',
		description: 'Create a WooCommerce product category.',
		path: '/wc/v3/products/categories',
		method: 'POST',
		properties: { name: { type: 'string' }, parent: ID, description: { type: 'string' } },
		required: [ 'name' ],
	},
	{
		name: 'woocommerce/create-product-tag',
		description: 'Create a WooCommerce product tag.',
		path: '/wc/v3/products/tags',
		method: 'POST',
		properties: { name: { type: 'string' }, description: { type: 'string' } },
		required: [ 'name' ],
	},
];

function toAbility( {
	name,
	description,
	path,
	method,
	properties,
	required,
	defaults,
	transform,
}: WooAbility ) {
	const callback = async ( input: unknown ) => {
		// Keep only the declared arguments; an empty object can arrive as `[]`.
		const given = input && typeof input === 'object' && ! Array.isArray( input ) ? input : {};
		const args: Args = { ...defaults };
		for ( const [ key, value ] of Object.entries( given ) ) {
			if ( key in properties ) {
				args[ key ] = value;
			}
		}

		let hasInvalidId = false;
		const requestPath = path.replace( /{(\w+)}/g, ( _, key: string ) => {
			// `Number()` alone would turn `true` into 1 and `[ 42 ]` into 42.
			const value = args[ key ];
			const isNumeric =
				typeof value === 'number' || ( typeof value === 'string' && /^\d+$/.test( value ) );
			const id = isNumeric ? Number( value ) : NaN;
			hasInvalidId ||= ! ( Number.isInteger( id ) && id > 0 );
			delete args[ key ];
			return String( id );
		} );

		if ( hasInvalidId ) {
			return errorResult( 'A positive integer ID is required.' );
		}

		try {
			const response = await apiFetch< Args >(
				method
					? { path: requestPath, method, data: args }
					: { path: addQueryArgs( requestPath, args ) }
			);
			return successResult( `${ name } succeeded.`, {
				response: transform ? transform( response ) : response,
			} );
		} catch ( error ) {
			return errorResult( ( error as { message?: string } )?.message ?? String( error ) );
		}
	};

	return {
		name,
		label: name,
		category: 'woocommerce',
		description,
		input_schema: { type: 'object', properties, required },
		callback,
	} as Ability;
}

const ABILITIES = WOO_ABILITIES.map( toAbility );

export const wooFallbackToolProvider: ToolProvider = {
	getAbilities: async () => ABILITIES,
	executeAbility: ( name: string, args: unknown ) =>
		executeAbilityFromList( ABILITIES, name, args ),
};

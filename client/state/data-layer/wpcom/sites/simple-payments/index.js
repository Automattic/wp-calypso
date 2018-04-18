/** @format */

/**
 * External dependencies
 */

import { get, noop, toPairs } from 'lodash';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import { decodeEntities } from 'lib/formatting';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { getFeaturedImageId } from 'lib/posts/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { isValidSimplePaymentsProduct } from 'lib/simple-payments/utils';
import { metaKeyToSchemaKeyMap, metadataSchema } from 'state/simple-payments/product-list/schema';
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';
import { TransformerError } from 'lib/make-json-schema-parser';
import {
	SIMPLE_PAYMENTS_PRODUCT_GET,
	SIMPLE_PAYMENTS_PRODUCTS_LIST,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_DELETE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_EDIT,
} from 'state/action-types';
import {
	receiveDeleteProduct,
	receiveProductsList,
	receiveUpdateProduct,
} from 'state/simple-payments/product-list/actions';

/**
 * Convert custom post metadata array to product attributes
 * @param { Array } metadata Array of post metadata
 * @returns { Object } properties extracted from the metadata, to be merged into the product object
 */
function customPostMetadataToProductAttributes( metadata ) {
	const productAttributes = {};

	metadata.forEach( ( { key, value } ) => {
		const schemaKey = metaKeyToSchemaKeyMap[ key ];
		if ( ! schemaKey ) {
			return;
		}

		// If the property's type is marked as boolean in the schema,
		// convert the value from PHP-ish truthy/falsy numbers to a plain boolean.
		// Strings "0" and "" are converted to false, "1" is converted to true.
		if ( metadataSchema[ schemaKey ].type === 'boolean' ) {
			value = !! Number( value );
		}

		productAttributes[ schemaKey ] = value;
	} );

	return productAttributes;
}

/**
 * Validates a `/posts` endpoint response and converts it into a product object
 * @param { Object } customPost raw /post endpoint response to format
 * @returns { Object } sanitized and formatted product
 */
export function customPostToProduct( customPost ) {
	if ( ! isValidSimplePaymentsProduct( customPost ) ) {
		throw new TransformerError( 'Custom post is not a valid simple payment product', customPost );
	}

	const metadataAttributes = customPostMetadataToProductAttributes( customPost.metadata );

	return {
		ID: customPost.ID,
		description: decodeEntities( customPost.content ),
		title: decodeEntities( customPost.title ),
		featuredImageId: getFeaturedImageId( customPost ),
		...metadataAttributes,
	};
}

/**
 * Extract custom posts array from `responseData`, filter out invalid items and convert the
 * valid custom posts to products.
 * @param {Object} responseData JSON data with shape `{ posts }`
 * @return {Array} validated and converted product list
 */
export function customPostsToProducts( responseData ) {
	if ( ! responseData.posts ) {
		// This is to disregard the memberships response.
		throw new TransformerError(
			'This is from Memberships response. We have to disregard it since' +
				'for some reason data layer does not handle multiple handlers corretly.'
		);
	}
	const posts = get( responseData, 'posts', [] );
	const validProducts = posts
		.map( post => {
			try {
				return customPostToProduct( post );
			} catch ( error ) {
				return null;
			}
		} )
		.filter( Boolean );
	return validProducts;
}

/**
 * Transforms a product definition object into proper custom post type
 * @param { Object } product action with product payload
 * @returns { Object } custom post type data
 */
export function productToCustomPost( product ) {
	// Get the `product` object entries and filter only those that will go into metadata
	const metadataEntries = toPairs( product ).filter( ( [ key ] ) => metadataSchema[ key ] );

	// add formatted_price to display money correctly
	if ( ! product.formatted_price ) {
		metadataEntries.push( [
			'formatted_price',
			formatCurrency( product.price, product.currency ),
		] );
	}

	// Convert the `product` entries into a metadata array
	const metadata = metadataEntries.map( ( [ key, value ] ) => {
		const entrySchema = metadataSchema[ key ];

		// If the property's type is marked as boolean in the schema,
		// convert the value to PHP-ish truthy/falsy numbers.
		if ( entrySchema.type === 'boolean' ) {
			value = value ? 1 : 0;
		}

		return {
			key: entrySchema.metaKey,
			value,
		};
	} );

	return {
		type: SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
		metadata,
		title: product.title,
		content: product.description,
		featured_image: product.featuredImageId || '',
	};
}

const replaceProductList = ( { siteId }, products ) => receiveProductsList( siteId, products );
const addOrUpdateProduct = ( { siteId }, newProduct ) => receiveUpdateProduct( siteId, newProduct );
const deleteProduct = ( { siteId }, deletedPost ) => receiveDeleteProduct( siteId, deletedPost.ID );

export const handleProductGet = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/posts/${ action.productId }`,
			},
			action
		),
	fromApi: customPostToProduct,
	onSuccess: addOrUpdateProduct,
	onError: noop,
} );

export const handleProductList = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/posts`,
				query: {
					type: SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
					status: 'publish',
				},
			},
			action
		),
	fromApi: customPostsToProducts,
	onSuccess: replaceProductList,
	onError: noop,
} );

export const handleProductListAdd = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'POST',
				path: `/sites/${ action.siteId }/posts/new`,
				body: productToCustomPost( action.product ),
			},
			action
		),
	fromApi: customPostToProduct,
	onSuccess: addOrUpdateProduct,
	onError: noop,
} );

export const handleProductListEdit = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'POST',
				path: `/sites/${ action.siteId }/posts/${ action.productId }`,
				body: productToCustomPost( action.product ),
			},
			action
		),
	fromApi: customPostToProduct,
	onSuccess: addOrUpdateProduct,
	onError: noop,
} );

export const handleProductListDelete = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'POST',
				path: `/sites/${ action.siteId }/posts/${ action.productId }/delete`,
			},
			action
		),
	onSuccess: deleteProduct,
	onError: noop,
} );

export default {
	[ SIMPLE_PAYMENTS_PRODUCT_GET ]: [ handleProductGet ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST ]: [ handleProductList ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD ]: [ handleProductListAdd ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_EDIT ]: [ handleProductListEdit ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_DELETE ]: [ handleProductListDelete ],
};

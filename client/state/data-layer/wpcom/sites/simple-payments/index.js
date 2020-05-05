/**
 * External dependencies
 */
import { get, noop, toPairs } from 'lodash';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { getFeaturedImageId } from 'state/posts/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { isValidSimplePaymentsProduct } from 'lib/simple-payments/utils';
import { metaKeyToSchemaKeyMap, metadataSchema } from 'state/simple-payments/product-list/schema';
import {
	SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
	NUMBER_OF_POSTS_BY_REQUEST,
} from 'lib/simple-payments/constants';
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

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Convert custom post metadata array to product attributes
 *
 * @param { Array } metadata Array of post metadata
 * @returns {object} properties extracted from the metadata, to be merged into the product object
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
 *
 * @param {object} customPost raw /post endpoint response to format
 * @returns {object} sanitized and formatted product
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
 *
 * @param {object} responseData JSON data with shape `{ posts }`
 * @returns {Array} validated and converted product list
 */
export function customPostsToProducts( responseData ) {
	const posts = get( responseData, 'posts', [] );
	const validProducts = posts
		.map( ( post ) => {
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
 *
 * @param {object} product action with product payload
 * @returns {object} custom post type data
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

export const handleProductGet = dispatchRequest( {
	fetch: ( action ) =>
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

export const handleProductList = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/posts`,
				query: {
					type: SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
					status: 'publish',
					number: NUMBER_OF_POSTS_BY_REQUEST,
				},
			},
			action
		),
	fromApi: customPostsToProducts,
	onSuccess: replaceProductList,
	onError: noop,
} );

export const handleProductListAdd = dispatchRequest( {
	fetch: ( action ) =>
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

export const handleProductListEdit = dispatchRequest( {
	fetch: ( action ) =>
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

export const handleProductListDelete = dispatchRequest( {
	fetch: ( action ) =>
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

registerHandlers( 'state/data-layer/wpcom/sites/simple-payments/index.js', {
	[ SIMPLE_PAYMENTS_PRODUCT_GET ]: [ handleProductGet ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST ]: [ handleProductList ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD ]: [ handleProductListAdd ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_EDIT ]: [ handleProductListEdit ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_DELETE ]: [ handleProductListDelete ],
} );

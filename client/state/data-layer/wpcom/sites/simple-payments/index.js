/**
 * External dependencies
 */
import { filter, noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SIMPLE_PAYMENTS_PRODUCT_GET,
	SIMPLE_PAYMENTS_PRODUCTS_LIST,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_EDIT,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_DELETE,
} from 'state/action-types';
import {
	receiveProduct,
	receiveProductsList,
	receiveUpdateProduct,
	receiveUpdateProductError,
	receiveDeleteProduct,
} from 'state/simple-payments/product-list/actions';
import { metaKeyToSchemaKeyMap, metadataSchema } from 'state/simple-payments/product-list/schema';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';
import { isValidSimplePaymentsProduct } from 'lib/simple-payments/utils';

/**
 * Reduce function for product attributes stored in post metadata
 * @param { Object }  sanitizedProductAttributes object with all sanitized attributes
 * @param { Object } current  item from post_meta to process
 * @returns { Object } sanitizedProductAttributes
 */
function reduceMetadata( sanitizedProductAttributes, current ) {
	if ( metaKeyToSchemaKeyMap[ current.key ] ) {
		sanitizedProductAttributes[ metaKeyToSchemaKeyMap[ current.key ] ] = current.value;
	}
	return sanitizedProductAttributes;
}

/**
 * Formats /posts endpoint response into a product list
 * @param { Object } product raw /post endpoint response to format
 * @returns { Object } sanitized and formatted product
 */
function customPostToProduct( product ) {
	return Object.assign(
		{
			ID: product.ID,
			description: product.content,
			title: product.title
		},
		product.metadata.reduce( reduceMetadata, {} )
	);
}

/**
 * Transforms a product definition object into proper custom post type
 * @param { Object } product action with product payload
 * @returns { Object } custom post type data
 */
function productToCustomPost( product ) {
	return Object.keys( product ).reduce(
		function( payload, current ) {
			if ( metadataSchema[ current ] ) {
				payload.metadata.push( {
					key: metadataSchema[ current ].metaKey,
					value: product[ current ]
				} );
			}
			return payload;
		},
		{
			type: SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
			metadata: [],
			title: product.title,
			content: product.description,
		}
	);
}

/**
 * Issues an API request to fetch a product by its ID for a site.
 *
 * @param  {Object}  store  Redux store
 * @param  {Object}  action Action object
 */
export function requestSimplePaymentsProduct( { dispatch }, action ) {
	const { siteId, productId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/sites/${ siteId }/posts/${ productId }`,
	}, action ) );
}

/**
 * Issues an API request to fetch products for a site.
 *
 * @param  {Object}  store  Redux store
 * @param  {Object}  action Action object
 */
export function requestSimplePaymentsProducts( { dispatch }, action ) {
	const { siteId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/sites/${ siteId }/posts`,
		query: {
			type: SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
			status: 'publish'
		},
	}, action ) );
}

/**
 * Issues an API request to add a new product
 * @param {Object} store Redux store
 * @param {Object} action Action object
 */
export function requestSimplePaymentsProductAdd( { dispatch }, action ) {
	const { siteId, product } = action;

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/posts/new`,
		body: productToCustomPost( product ),
	}, action ) );
}

/**
 * Issues an API request to edit a product
 * @param {Object} store Redux store
 * @param {Object} action Action object
 */
export function requestSimplePaymentsProductEdit( { dispatch }, action ) {
	const { siteId, product, productId } = action;

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/posts/${ productId }`,
		body: productToCustomPost( product ),
	}, action ) );
}

/**
 * Issues an API request to delete a product
 * @param {Object} store Redux store
 * @param {Object} action Action object
 */
export function requestSimplePaymentsProductDelete( { dispatch }, action ) {
	const { siteId, productId } = action;

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/posts/${ productId }/delete`,
	}, action ) );
}

export const addProduct = ( { dispatch }, { siteId, requestId }, next, newProduct ) =>
	dispatch( receiveUpdateProduct( siteId, customPostToProduct( newProduct ), requestId ) );

export const handleAddProductError = ( { dispatch }, { siteId, requestId }, next, error ) =>
	dispatch( receiveUpdateProductError( siteId, error, requestId ) );

export const deleteProduct = ( { dispatch }, { siteId }, next, deletedProduct ) =>
	dispatch( receiveDeleteProduct( siteId, deletedProduct.ID ) );

export const listProduct = ( { dispatch }, { siteId }, next, product ) => {
	if ( ! isValidSimplePaymentsProduct( product ) ) {
		return;
	}

	dispatch( receiveProduct( siteId, customPostToProduct( product ) ) );
};

export const listProducts = ( { dispatch }, { siteId }, next, { posts: products } ) => {
	const validProducts = filter( products, isValidSimplePaymentsProduct );

	dispatch( receiveProductsList( siteId, validProducts.map( customPostToProduct ) ) );
};

export default {
	[ SIMPLE_PAYMENTS_PRODUCT_GET ]:
		[ dispatchRequest( requestSimplePaymentsProduct, listProduct, noop ) ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST ]:
		[ dispatchRequest( requestSimplePaymentsProducts, listProducts, noop ) ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD ]: [ dispatchRequest( requestSimplePaymentsProductAdd, addProduct, handleAddProductError ) ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_EDIT ]: [ dispatchRequest( requestSimplePaymentsProductEdit, addProduct, handleAddProductError ) ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_DELETE ]:
		[ dispatchRequest( requestSimplePaymentsProductDelete, deleteProduct, noop ) ],
};

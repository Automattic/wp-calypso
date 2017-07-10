/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	SIMPLE_PAYMENTS_PRODUCTS_LIST,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_EDIT,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_DELETE,
} from 'state/action-types';
import {
	receiveProductsList,
	receiveUpdateProduct,
	receiveDeleteProduct,
} from 'state/simple-payments/product-list/actions';
import { metaKeyToSchemaKeyMap, metadataSchema } from 'state/simple-payments/product-list/schema';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { getRawSite } from 'state/sites/selectors';
import { errorNotice } from 'state/notices/actions';

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
			type: 'jp_pay_product',
			metadata: [],
			title: product.title,
			content: product.description,
		}
	);
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
			type: 'jp_pay_product',
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

export const addProduct = ( { dispatch }, { siteId }, next, newProduct ) =>
	dispatch( receiveUpdateProduct( siteId, customPostToProduct( newProduct ) ) );

export const deleteProduct = ( { dispatch }, { siteId }, next, deletedProduct ) =>
	dispatch( receiveDeleteProduct( siteId, deletedProduct.ID ) );

export const listProducts = ( { dispatch }, { siteId }, next, { found: numOfProducts, posts: products } ) =>
	dispatch( receiveProductsList( siteId, numOfProducts, products.map( customPostToProduct ) ) );

const announceListingProductsFailure = ( { dispatch, getState }, { siteId } ) => {
	const site = getRawSite( getState(), siteId );
	const error = site && site.name
		? translate( 'Failed to retrieve products for site “%(siteName)s.”', { args: { siteName: site.name } } )
		: translate( 'Failed to retrieve products for your site.' );

	dispatch( errorNotice( error ) );
};

export default {
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST ]:
		[ dispatchRequest( requestSimplePaymentsProducts, listProducts, announceListingProductsFailure ) ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD ]: [ dispatchRequest( requestSimplePaymentsProductAdd, addProduct ) ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_EDIT ]: [ dispatchRequest( requestSimplePaymentsProductEdit, addProduct ) ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_DELETE ]: [ dispatchRequest( requestSimplePaymentsProductDelete, deleteProduct ) ],
};

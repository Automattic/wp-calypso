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
	requestingProductList,
	successProductListRequest,
	failProductListRequest,
	receiveUpdateProduct,
	receiveDeleteProduct,
} from 'state/simple-payments/product-list/actions';
import { isRequestingSimplePaymentsProductList } from 'state/selectors';
import { metaKeyToSchemaKeyMap, metadataSchema } from 'state/simple-payments/product-list/schema';
import wpcom from 'lib/wp';
import debug from 'debug';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-simple-payments' );

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
			content: product.content,
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
 * Issues an API request to fetch media for a site and query.
 *
 * @param  {Object}  store  Redux store
 * @param  {Object}  action Action object
 * @return {Promise}        Promise
 */
export function requestSimplePaymentsProducts( { dispatch, getState }, { siteId } ) {
	if ( isRequestingSimplePaymentsProductList( getState(), siteId ) ) {
		return;
	}

	dispatch( requestingProductList( siteId ) );
	log( 'Request product list for site %d using query %o', siteId );

	return wpcom
		.site( siteId )
		.postsList( {
			type: 'jp_pay_product',
			status: 'publish'
		} )
		.then( ( { found, posts } ) => {
			dispatch( receiveProductsList( siteId, found, posts.map( customPostToProduct ) ) );
			dispatch( successProductListRequest( siteId ) );
		}	)
		.catch( err => dispatch( failProductListRequest( siteId, err ) ) );
}

/**
 * Issues an API request to add a new product
 * @param {Object} store Redux store
 * @param {Object} action Action object
 * @return {Promise} Promise
 */
export function requestSimplePaymentsProductAdd( { dispatch }, action ) {
	return wpcom
		.site( action.siteId )
		.addPost( productToCustomPost( action.product ) )
		.then( ( newProduct ) => {
			dispatch( receiveUpdateProduct( action.siteId, customPostToProduct( newProduct ) ) );
		} );
}

/**
 * Issues an API request to edit a product
 * @param {Object} store Redux store
 * @param {Object} action Action object
 * @return {Promise} Promise
 */
export function requestSimplePaymentsProductEdit( { dispatch }, action ) {
	return wpcom
		.site( action.siteId )
		.post( action.postId )
		.update( productToCustomPost( action.product ) )
		.then( ( newProduct ) => {
			dispatch( receiveUpdateProduct( action.siteId, customPostToProduct( newProduct ) ) );
		} );
}

/**
 * Issues an API request to delete a product
 * @param {Object} store Redux store
 * @param {Object} action Action object
 * @return {Promise} Promise
 */
export function requestSimplePaymentsProductDelete( { dispatch }, action ) {
	return wpcom
		.site( action.siteId )
		.deletePost( action.postId )
		.then( ( deletedProduct ) => {
			dispatch( receiveDeleteProduct( action.siteId, deletedProduct.ID ) );
		} );
}

export default {
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST ]: [ requestSimplePaymentsProducts ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD ]: [ requestSimplePaymentsProductAdd ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_EDIT ]: [ requestSimplePaymentsProductEdit ],
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_DELETE ]: [ requestSimplePaymentsProductDelete ],
};

/**
 * External dependencies
 */
import { isNumber } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_EXISTING_PRODUCT,
	WOOCOMMERCE_EDIT_NEW_PRODUCT,
	WOOCOMMERCE_EDIT_EXISTING_PRODUCT_VARIATION_TYPE,
	WOOCOMMERCE_EDIT_NEW_PRODUCT_VARIATION_TYPE,
} from '../../action-types';

const debug = debugFactory( 'woocommerce:state:ui:products' );

const initialState = null;

export default function( state = initialState, action ) {
	const handlers = {
		[ WOOCOMMERCE_EDIT_EXISTING_PRODUCT ]: editExistingProductAction,
		[ WOOCOMMERCE_EDIT_NEW_PRODUCT ]: editNewProductAction,
		[ WOOCOMMERCE_EDIT_EXISTING_PRODUCT_VARIATION_TYPE ]: editExistingProductVariationTypeAction,
		[ WOOCOMMERCE_EDIT_NEW_PRODUCT_VARIATION_TYPE ]: editNewProductVariationTypeAction,
	};

	const handler = handlers[ action.type ];

	return ( handler && handler( state, action ) ) || state;
}

function editExistingProductAction( edits, action ) {
	const { product, data } = action.payload;

	const prevEdits = edits || {};
	const updates = editExistingProduct( prevEdits.updates, product, data );
	return { ...prevEdits, updates };
}

function editNewProductAction( edits, action ) {
	const { data, newProductIndex } = action.payload;

	const prevEdits = edits || {};
	const creates = editNewProduct( prevEdits.creates, newProductIndex, data );
	return { ...prevEdits, creates };
}

function editExistingProductVariationTypeAction( edits, action ) {
	const { product, attributeIndex, data } = action.payload;
	const attributes = product && product.attributes;

	const _attributes = editProductVariationType( attributes, attributeIndex, data );

	const prevEdits = edits || {};
	const updates = editExistingProduct( prevEdits.updates, product, { attributes: _attributes } );
	return { ...prevEdits, updates };
}

function editNewProductVariationTypeAction( edits, action ) {
	const { newProductIndex, product, attributeIndex, data } = action.payload;
	const attributes = product && product.attributes;

	const _attributes = editProductVariationType( attributes, attributeIndex, data );

	const prevEdits = edits || {};
	const creates = editNewProduct( prevEdits.creates, newProductIndex, { attributes: _attributes } );
	return { ...prevEdits, creates };
}

function editExistingProduct( updates, product, data ) {
	const prevUpdates = updates || [];

	let found = false;

	const _updates = prevUpdates.map( ( prevUpdate ) => {
		if ( product.id === prevUpdate.id ) {
			found = true;
			return { ...prevUpdate, ...data };
		}

		return prevUpdate;
	} );

	if ( ! found ) {
		_updates.push( { id: product.id, ...data } );
	}

	return _updates;
}

function editNewProduct( creates, newProductIndex, data ) {
	const prevCreates = creates || [];
	const index = ( isNumber( newProductIndex ) ? newProductIndex : prevCreates.length );

	const _creates = [ ...prevCreates ];
	const prevCreate = prevCreates[ index ] || {};

	_creates[ index ] = { ...prevCreate, ...data };

	return _creates;
}

function editProductVariationType( attributes, attributeIndex, data ) {
	const prevAttributes = attributes || [];
	const index = ( isNumber( attributeIndex ) ? attributeIndex : prevAttributes.length );

	const _attributes = [ ...prevAttributes ];
	const prevAttribute = prevAttributes[ index ] || { variation: true, options: [] };

	if ( prevAttribute.variation ) {
		_attributes[ index ] = { ...prevAttribute, ...data };
	} else {
		debug( 'WARNING: Attempting to edit a non-variation attribute as a variation type.' );
	}

	return _attributes;
}

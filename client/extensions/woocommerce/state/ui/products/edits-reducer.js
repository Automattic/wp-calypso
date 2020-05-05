/**
 * External dependencies
 */

import { compact, isEqual, filter, uniqueId } from 'lodash';
import { withoutPersistence } from 'state/utils';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_DELETE,
	WOOCOMMERCE_PRODUCT_EDIT,
	WOOCOMMERCE_PRODUCT_EDIT_CLEAR,
	WOOCOMMERCE_PRODUCT_UPDATE,
	WOOCOMMERCE_PRODUCT_UPDATED,
	WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
} from 'woocommerce/state/action-types';
import { getBucket } from '../helpers';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_PRODUCT_EDIT:
			return editProductAction( state, action );
		case WOOCOMMERCE_PRODUCT_DELETE:
			return deleteProductAction( state, action );
		case WOOCOMMERCE_PRODUCT_EDIT_CLEAR:
			return clearEditsAction( state, action );
		case WOOCOMMERCE_PRODUCT_UPDATED:
			return productUpdatedAction( state, action );
		case WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT:
			return editProductAttributeAction( state, action );
		case WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED:
			return productCategoryUpdatedAction( state, action );
	}

	return state;
} );

function productUpdatedAction( edits, action ) {
	const { originatingAction } = action;
	let bucket = null;

	bucket = WOOCOMMERCE_PRODUCT_CREATE === originatingAction.type ? 'creates' : bucket;
	bucket = WOOCOMMERCE_PRODUCT_UPDATE === originatingAction.type ? 'updates' : bucket;

	if ( bucket ) {
		const productId = originatingAction.product.id;
		const prevEdits = edits || {};
		const prevBucketEdits = prevEdits[ bucket ] || [];

		const newBucketEdits = compact(
			prevBucketEdits.map( ( productEdit ) => {
				return isEqual( productId, productEdit.id ) ? undefined : productEdit;
			} )
		);

		return {
			...prevEdits,
			[ bucket ]: newBucketEdits.length ? newBucketEdits : undefined,
		};
	}

	return edits;
}

function productCategoryUpdatedAction( edits, action ) {
	const { data, originatingAction } = action;

	if ( WOOCOMMERCE_PRODUCT_CATEGORY_CREATE === originatingAction.type ) {
		const prevCategoryId = originatingAction.category.id;
		const newCategoryId = data.id;
		const prevEdits = edits || {};

		const buckets = [ 'creates', 'updates' ].map( ( bucket ) => {
			const prevBucket = prevEdits[ bucket ] || [];

			const newBucket = prevBucket.map( ( product ) => {
				const prevCategories = product.categories || [];
				const newCategories = prevCategories.map( ( category ) => {
					if ( isEqual( prevCategoryId, category.id ) ) {
						return { ...category, id: newCategoryId };
					}
					return category;
				} );
				return { ...product, categories: newCategories };
			} );

			return newBucket.length ? newBucket : undefined;
		} );

		return {
			...prevEdits,
			creates: buckets[ 0 ],
			updates: buckets[ 1 ],
		};
	}
	return edits;
}

function clearEditsAction() {
	return null;
}

function editProductAction( edits, action ) {
	const { product, data } = action;
	const prevEdits = edits || {};
	const bucket = getBucket( product );
	const _product = product || { id: { placeholder: uniqueId( 'product_' ) } };
	const _array = editProduct( prevEdits[ bucket ], _product, data );

	if ( isEqual( {}, data ) ) {
		// If data is empty, only set the currentlyEditingId.
		return {
			...prevEdits,
			currentlyEditingId: _product.id,
		};
	}

	return {
		...prevEdits,
		[ bucket ]: _array,
		currentlyEditingId: _product.id,
	};
}

function editProductAttributeAction( edits, action ) {
	const { product, attribute, data } = action;
	const attributes = product && product.attributes;

	const prevEdits = edits || {};
	const bucket = getBucket( product );
	const _attributes = editProductAttribute( attributes, attribute, data );
	const _product = product || { id: { placeholder: uniqueId( 'product_' ) } };
	const _array = editProduct( prevEdits[ bucket ], _product, { attributes: _attributes } );

	return {
		...prevEdits,
		[ bucket ]: _array,
		currentlyEditingId: _product.id,
	};
}

function editProduct( array, product, data ) {
	// Use the existing product id (real or placeholder), or creates.length if no product.
	const prevArray = array || [];

	let found = false;

	// Look for this object in the appropriate create or edit array first.
	const _array = prevArray.map( ( p ) => {
		if ( isEqual( product.id, p.id ) ) {
			found = true;
			return { ...p, ...data };
		}

		return p;
	} );

	if ( ! found ) {
		// update or create not already in edit state, so add it now.
		_array.push( { id: product.id, ...data } );
	}

	return _array;
}

export function editProductAttribute( attributes, attribute, data ) {
	const prevAttributes = attributes || [];
	const name = attribute && attribute.name;
	const uid = ( attribute && attribute.uid ) || uniqueId( 'edit_' ) + new Date().getTime();

	let found = false;

	// Look for this attribute in the array of attributes first.
	const _attributes = prevAttributes.map( ( a ) => {
		if ( ( uid && isEqual( uid, a.uid ) ) || ( name && isEqual( name, a.name ) ) ) {
			found = true;
			return { ...attribute, ...data, uid };
		}

		return a;
	} );

	if ( ! found ) {
		// Attribute has not yet been edited, so add it now.
		_attributes.push( { ...data, uid } );
	}

	return _attributes;
}

export function deleteProductAction( edits, action ) {
	const { productId } = action;
	const prevEdits = edits || {};

	if ( prevEdits && prevEdits.updates ) {
		const newUpdates = filter( prevEdits.updates, ( product ) => product.id !== productId );
		return {
			...prevEdits,
			updates: newUpdates,
		};
	}

	return edits;
}

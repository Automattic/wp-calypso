/**
 * External dependencies
 */

import { compact, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT_CLEAR,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
} from 'woocommerce/state/action-types';
import { getBucket } from '../helpers';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_PRODUCT_CATEGORY_EDIT:
			return editProductCategoryAction( state, action );
		case WOOCOMMERCE_PRODUCT_CATEGORY_EDIT_CLEAR:
			return clearEditsAction( state, action );
		case WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED:
			return productCategoryUpdatedAction( state, action );
	}

	return state;
} );

function productCategoryUpdatedAction( edits, action ) {
	const { originatingAction } = action;

	if ( WOOCOMMERCE_PRODUCT_CATEGORY_CREATE === originatingAction.type ) {
		const prevCategoryId = originatingAction.category.id;
		const prevEdits = edits || {};
		const prevCreates = prevEdits.creates || [];

		const newCreates = compact(
			prevCreates.map( ( category ) => {
				if ( isEqual( prevCategoryId, category.id ) ) {
					// Remove this create, it's no longer needed.
					return undefined;
				}
				return category;
			} )
		);

		return {
			...prevEdits,
			creates: newCreates.length ? newCreates : undefined,
		};
	}

	if ( WOOCOMMERCE_PRODUCT_CATEGORY_UPDATE === originatingAction.type ) {
		const prevCategoryId = originatingAction.category.id;
		const prevEdits = edits || {};
		const prevUpdates = prevEdits.updates || [];

		const newUpdates = compact(
			prevUpdates.map( ( category ) => {
				if ( isEqual( prevCategoryId, category.id ) ) {
					return undefined;
				}
				return category;
			} )
		);

		return {
			...prevEdits,
			updates: newUpdates.length ? newUpdates : undefined,
		};
	}
	// TODO: Add support for delete.

	return edits;
}

function clearEditsAction() {
	return null;
}

function editProductCategoryAction( edits, action ) {
	const { category, data } = action;
	const prevEdits = edits || {};
	const bucket = getBucket( category );
	const newArray = editProductCategory( prevEdits[ bucket ], category, data );

	return {
		...prevEdits,
		[ bucket ]: newArray,
		currentlyEditingId: category.id,
	};
}

function editProductCategory( array, category, data ) {
	const prevArray = array || [];

	let found = false;

	// Look for this object in the appropriate create or edit array first.
	const newArray = compact(
		prevArray.map( ( c ) => {
			if ( isEqual( category.id, c.id ) ) {
				found = true;

				// If data is null, remove this edit, otherwise update the edit data.
				return data ? { ...c, ...data } : undefined;
			}
			return c;
		} )
	);

	if ( ! found ) {
		// update or create not already in edit state, so add it now.
		newArray.push( { id: category.id, ...data } );
	}

	return newArray;
}

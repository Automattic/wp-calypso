/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
} from 'woocommerce/state/action-types';
import { getBucket } from '../helpers';

export default createReducer( null, {
	[ WOOCOMMERCE_PRODUCT_CATEGORY_EDIT ]: editProductCategoryAction,
} );

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
	const newArray = compact( prevArray.map( ( c ) => {
		if ( category.id === c.id ) {
			found = true;

			// If data is null, remove this edit, otherwise update the edit data.
			return ( data ? { ...c, ...data } : undefined );
		}
		return c;
	} ) );

	if ( ! found ) {
		// update or create not already in edit state, so add it now.
		newArray.push( { id: category.id, ...data } );
	}

	return newArray;
}


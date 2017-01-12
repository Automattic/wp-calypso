/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { TYPES } from './actions';

// TODO: Remove this temporary code.
import dummyProducts from '../../dummy-products.json';

export const initialState = {
	products: dummyProducts,
	edits: null,
	display: {
		showColumnPanel: false,
		columnSelections: null,
	},
};

const handlerMap = {
	[ TYPES.INIT_EDITS ]: initEdits,
	[ TYPES.CANCEL_EDITS ]: cancelEdits,
	[ TYPES.SAVING_EDITS ]: savingEdits,
	[ TYPES.EDITS_SAVED ]: editsSaved,
	[ TYPES.ADD_PRODUCT ]: addProduct,
	[ TYPES.EDIT_PRODUCT ]: editProduct,
	[ TYPES.DELETE_PRODUCT ]: deleteProduct,
	[ TYPES.SET_DISPLAY_OPTION ]: productsSetDisplayOption,
};

export default function reducer( state, action ) {
	const handler = handlerMap[ action.type ];
	let returnState = state || initialState;

	if ( handler ) {
		returnState = handler( state, action );
	}

	return returnState;
}

function initEdits( state ) {
	if ( ! state.edits ) {
		return Object.assign( {}, state, {
			edits: {},
		} );
	}

	// Edits already initialized.
	return state;
}

function cancelEdits( state ) {
	return Object.assign( {}, state, {
		edits: null,
		saving: null,
	} );
}

function savingEdits( state ) {
	// Save current edits set to a saving set.
	return Object.assign( {}, state, {
		saving: Object.assign( {}, state.edits )
	} );
}

function editsSaved( state, action ) {
	// TODO: add create/delete
	const { update } = action.payload;

	let products = state.products;

	// Replace all products that have been updated.
	if ( update ) {
		const ids = update.map( ( p ) => p.id );

		products = state.products.map( ( product ) => {
			const index = ids.indexOf( product.id );
			return ( index > -1 ? update[ index ] : product );
		} );
	}

	return Object.assign( {}, state, {
		products,
		edits: null,
		saving: null,
	} );
}

function addProduct( state ) {
	const data = {};
	const edits = state.edits || {};
	const add = edits.add || [];

	// Create a new product object. Always add it to the beginning of the array.
	const newAdd = [ data, ...add ];
	const newEdits = Object.assign( {}, edits, { add: newAdd } );
	const newState = Object.assign( {}, state, { edits: newEdits } );

	return newState;
}

function editProduct( state, action ) {
	const { id, key, value } = action.payload;
	const edits = state.edits || {};
	const update = edits && edits.update || [];
	const entry = update.find( ( p ) => id === p.id ) || {};
	const newEntry = Object.assign( {}, entry, { id, [ key ]: value } );

	const newUpdate = update.filter( ( p ) => p.id !== id );
	newUpdate.push( newEntry );

	const newEdits = Object.assign( {}, edits, { update: newUpdate } );
	const newState = Object.assign( {}, state, { edits: newEdits } );

	return newState;
}

function deleteProduct( state, action ) {
	const { id } = action.payload;
	const edits = state.edits || {};
	const deletes = edits.delete || [];

	// Add the id of the product to delete.
	const newDelete = [ ...deletes, id ];
	const newEdits = Object.assign( {}, edits, { deletes: newDelete } );
	const newState = Object.assign( {}, state, { edits: newEdits } );

	return newState;
}

function productsSetDisplayOption( state, action ) {
	const { option, value } = action.payload;
	const display = Object.assign( {}, state.display, { [ option ]: value } );

	return Object.assign( {}, state, {
		display
	} );
}


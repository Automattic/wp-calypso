// External dependencies
import assign from 'lodash/assign';
import find from 'lodash/find';

export const getByPurchaseId = ( state, id ) => (
	assign( {}, state, { data: find( state.data, { id } ) } )
);

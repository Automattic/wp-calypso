/**
 * External Dependencies
 */
import assign from 'lodash/object/assign';
import find from 'lodash/collection/find';
import where from 'lodash/collection/where';

/**
 * Internal Dependencies
 */
import { createReducerStore } from 'lib/store';
import { initialState, reducer } from './reducer';

const PurchasesStore = createReducerStore( reducer, initialState );

assign( PurchasesStore, {
	getBySite( siteId ) {
		return assign( {}, this.get(), { data: where( this.get().data, { siteId } ) } );
	},

	getByUser( userId ) {
		return assign( {}, this.get(), { data: where( this.get().data, { userId } ) } );
	},

	getByPurchaseId( id ) {
		return assign( {}, this.get(), { data: find( this.get().data, { id } ) } );
	}
} );

export default PurchasesStore;

/**
 * External dependencies
 */
import debugFactory from 'debug';
import get from 'lodash/get'

/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';

const debug = debugFactory( 'calypso:customize:muse' );
const initialState = { customizations: [] };

export default createReducerStore( ( state, { action } ) => {
	switch ( action.type ) {
		case 'RECEIVED_MUSE_CUSTOMIZATIONS':
			const data = get( action, 'data.customizations', [] );
			debug( `saving ${data.length} customizations` );
			return Object.assign( {}, state, { customizations: data } );
	}
	return state;
}, initialState );

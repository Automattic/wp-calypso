/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;
export const getVerticals = ( state: State ) => state.verticals;

export const getVerticalItem = ( state: State, id: string ) =>
	getVerticals( state ).find( v => v.vertical_id === id );

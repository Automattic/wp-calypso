import store from './store';
import { actions } from './constants';

export const setGlobalData = ( data ) =>
	store.dispatch( {
		type: actions.SET_GLOBAL_DATA,
		data,
	} );

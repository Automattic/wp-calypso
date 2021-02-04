/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import currency from './currency/reducer';
import methods from './methods/reducer';

const methodsReducer = combineReducers( {
	currency,
	methods,
} );

export default keyedReducer( 'siteId', methodsReducer );

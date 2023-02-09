import { plugins, registerStore, use } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import persistOptions from '../one-week-persistence-config';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';

export type { State };

export function register(): typeof STORE_KEY {
	use( plugins.persistence, persistOptions );

	registerStore( STORE_KEY, {
		actions,
		controls,
		reducer,
		selectors,
		persist: [ 'stepData' ],
	} );

	return STORE_KEY;
}

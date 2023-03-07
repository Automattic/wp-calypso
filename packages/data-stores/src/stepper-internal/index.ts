import { plugins, registerStore, use } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import persistOptions from '../one-week-persistence-config';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { SelectFromMap } from '../mapped-types';

export type { State };
export type StepperInternalSelect = SelectFromMap< typeof selectors >;

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

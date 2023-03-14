import { plugins, registerStore, use } from '@wordpress/data';
import persistOptions from '../one-week-persistence-config';
import { controls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

export type { State };
export { STORE_KEY };

use( plugins.persistence, persistOptions );

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore( STORE_KEY, {
			actions,
			controls,
			reducer,
			resolvers,
			selectors,
			persist: [ 'teams' ],
		} );
	}
	return STORE_KEY;
}

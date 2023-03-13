import { registerStore } from '@wordpress/data';
import { controls as dataControls } from '@wordpress/data-controls';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import { createActions, ActionsConfig } from './actions';
import { STORE_KEY } from './constants';
import { controls } from './controls';
import reducer, { State } from './reducer';
import * as selectors from './selectors';

export * from './types';
export type { State };

let isRegistered = false;
export function register( config: ActionsConfig ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;

		requestAllBlogsAccess().catch( () => {
			throw new Error( 'Could not get all blog access.' );
		} );

		registerStore( STORE_KEY, {
			actions: createActions( config ),
			controls: {
				...controls,
				...dataControls,
				...wpcomRequestControls,
			},
			reducer,
			selectors,
		} );
	}
	return STORE_KEY;
}

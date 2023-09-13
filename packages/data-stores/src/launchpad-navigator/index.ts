import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as selectors from './selectors';

let isRegistered = false;

export function register(): typeof STORE_KEY {
	registerPlugins();

	if ( ! isRegistered ) {
		registerStore( STORE_KEY, {
			actions,
			reducer,
			controls: { ...controls, ...wpcomRequestControls },
			selectors,
			persist: [ 'activeChecklistSlug' ],
		} );
		isRegistered = true;
	}

	return STORE_KEY;
}

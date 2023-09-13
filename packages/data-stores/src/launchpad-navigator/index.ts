import { createReduxStore, register } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as selectors from './selectors';

export const store = createReduxStore( STORE_KEY, {
	actions,
	controls: { ...controls, ...wpcomRequestControls },
	reducer,
	selectors,
} );

register( store );

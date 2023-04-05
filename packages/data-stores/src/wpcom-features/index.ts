import { register, createReduxStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { Reducer, AnyAction } from 'redux';

export type { State };
export type { FeatureId, Feature } from './types';

export { featuresList } from './features-data';

export const store = createReduxStore( STORE_KEY, {
	controls,
	reducer: reducer as Reducer< State, AnyAction >,
	selectors,
} );

register( store );

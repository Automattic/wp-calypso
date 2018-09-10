/** @format */
console.log( '[state/preferences/index]' );

/**
 * Internal dependencies
 */
import * as actions from './actions';
import * as selectors from './_selectors';
import reducer from './reducer';
import registry from 'state/wp-data/registry';

const options = {
	parent: 'calypso',
	reducerKey: 'calypso/preferences',
	reducers: {
		preferences: reducer,
	},
	selectors,
	actions,
};

export function registerStore() {
	if ( ! registry.select( 'calypso/preferences' ) ) {
		registry.registerChildStore( 'calypso/preferences', options );
	}
}

export default options;

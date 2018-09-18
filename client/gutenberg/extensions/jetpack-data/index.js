/** @format */

/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

const ACTION_FETCH_ALL = 'ACTION_FETCH_ALL';
const ACTION_RECEIVE_ALL = 'ACTION_RECEIVE_ALL';

const actions = {
	fetchAllModules() {
		return { type: ACTION_FETCH_ALL };
	},
	receiveAllModules( modules ) {
		return {
			type: ACTION_RECEIVE_ALL,
			modules,
		};
	},
};

const DEFAULT_STATE = {};
registerStore( 'jetpack/modules', {
	actions,
	reducer( state = DEFAULT_STATE, action ) {
		switch ( action.type ) {
			case ACTION_RECEIVE_ALL:
				return action.modules;
		}
		return state;
	},
	resolvers: {
		async *getAllModules() {
			const modules = await apiFetch( { path: '/jetpack/v4/module/all' } );
			yield actions.receiveAllModules( modules );
		},
	},
	selectors: {
		getAllModules( state ) {
			return state;
		},
	},
} );

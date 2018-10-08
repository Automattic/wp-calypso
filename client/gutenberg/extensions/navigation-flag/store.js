/**
 * WordPress Dependencies
 */
import { registerStore } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

/**
 * External dependencies
 */

 /**
 * Internal dependencies
 */

const actions = {

	setOrganization( organization ) {
		return {
			type: 'SET_ORGANIZATION',
			organization,
		};
	},

	receiveOrganization( path ) {
		return {
			type: 'RECEIVE_ORGANIZATION',
			path,
		};
	}

};

const store = registerStore( 'atavist/site-options', {

	reducer( state = { organization: {} }, action ) {
		switch ( action.type ) {
			case 'SET_ORGANIZATION':
				return {
					...state,
					organization: action.organization,
				};
			case 'RECEIVE_ORGANIZATION':
				return action.organization;
		}

		return state;
	},

	actions,

	selectors: {

		receiveOrganization( state ) {
			return state.organization;
		},

	},

	resolvers: {

		*receiveOrganization() {
			const settings = apiFetch( { path: 'atavist/site-options' } ).then( siteOptions => {
				return actions.setOrganization( siteOptions );
			} );

			yield settings;
		}

	}
} );

export default store;

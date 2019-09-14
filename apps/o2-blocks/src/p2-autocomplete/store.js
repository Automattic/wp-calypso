/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { includes, map } from 'lodash';
import { registerStore } from '@wordpress/data';

const actions = {
	setP2s( p2s ) {
		return {
			type: 'SET_P2s',
			p2s,
		};
	},

	fetchFromAPI( path ) {
		return {
			type: 'FETCH_FROM_API',
			path,
		};
	},
};

export default registerStore( 'internal/P2s', {
	reducer( state = [], action ) {
		switch ( action.type ) {
			case 'SET_P2S':
				return action.p2s;
		}

		return state;
	},

	actions,

	selectors: {
		getP2s( state, search ) {
			return state.find( p2 => includes( p2.subdomain, search ) || includes( p2.title, search ) );
		},
	},

	controls: {
		FETCH_FROM_API( { path } ) {
			return apiFetch( path ).then( result =>
				map( result.list, ( p2, subdomain ) => ( { ...p2, subdomain } ) )
			);
		},
	},

	resolvers: {
		*getP2s( search ) {
			const p2s = yield actions.fetchFromAPI( addQueryArgs( '/internal/P2s', { search } ) );
			return actions.setP2s( p2s );
		},
	},
} );

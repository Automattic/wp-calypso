import wpcom from 'calypso/lib/wp';
import { PLUGIN_SETUP_INSTRUCTIONS_RECEIVE } from 'calypso/state/action-types';

import 'calypso/state/plugins/init';

/**
 *  Local variables;
 */
const _fetching = {};

const normalizePluginInstructions = ( data ) => {
	const _plugins = data.keys;
	return Object.keys( _plugins || {} ).map( ( slug ) => {
		const apiKey = _plugins[ slug ];
		return {
			slug: slug,
			name: slug,
			key: apiKey,
			status: 'wait',
			error: null,
		};
	} );
};

export function fetchInstallInstructions( siteId ) {
	return ( dispatch ) => {
		if ( _fetching[ siteId ] ) {
			return;
		}
		_fetching[ siteId ] = true;

		wpcom.req
			.get( `/jetpack-blogs/${ siteId }/keys` )
			.then( ( data ) => {
				dispatch( {
					type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
					siteId,
					data: normalizePluginInstructions( data ),
				} );
			} )
			.catch( () => {
				dispatch( {
					type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
					siteId,
					data: [],
				} );
			} );
	};
}

import page from 'page';
import {
	get,
	has,
} from 'lodash';

import wpcom from 'lib/wp';

const pinghubPath = '/wpcom/me/calypso-remote-dispatcher';

const subscribe = dispatch => {
	wpcom.pinghub.connect( pinghubPath, ( error, event ) => {
		if ( error ) {
			return;
		}

		let data;
		try {
			data = JSON.parse( get( event, 'body.data', '{}' ) );
		} catch ( e ) {
			return;
		}

		if ( has( data, 'type' ) ) {
			const { type, path } = data;

			if ( 'ROUTE_SET' === type && path ) {
				page( path );
			}

			dispatch( data );
		}
	} );
};

export const remoteActionEnhancer = next => ( ...args ) => {
	const store = next( ...args );

	wpcom.pinghub.disconnect( pinghubPath );
	subscribe( store.dispatch );

	return store;
};

export default remoteActionEnhancer;

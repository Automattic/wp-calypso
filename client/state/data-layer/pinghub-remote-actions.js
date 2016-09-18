import {
	get,
	has,
} from 'lodash';

import wpcom from 'lib/wp';

const path = '/wpcom/me/calypso-remote-dispatcher';

export const subscribe = dispatch => {
	wpcom.pinghub.connect( path, ( error, event ) => {
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
			dispatch( data );
		}
	} );
};

export default subscribe;

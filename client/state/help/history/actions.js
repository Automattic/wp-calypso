import wpcom from 'calypso/lib/wp';
import { SUPPORT_HISTORY_SET } from 'calypso/state/action-types';

import 'calypso/state/help/init';

export const requestSupportHistory = ( email ) => ( dispatch ) => {
	wpcom.req
		.get( '/support-history', { apiNamespace: 'wpcom/v2', email } )
		.then( ( response ) =>
			dispatch( {
				type: SUPPORT_HISTORY_SET,
				items: response.data,
			} )
		)
		.catch( () => {} );
};

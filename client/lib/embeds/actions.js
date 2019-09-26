/**
 * Internal dependencies
 */

import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

export default {
	fetch( siteId, url ) {
		const siteHandle = wpcom.undocumented().site( siteId );
		let args;

		if ( url ) {
			Dispatcher.handleViewAction( {
				type: 'FETCH_EMBED',
				siteId: siteId,
				url: url,
			} );

			args = {
				embed_url: url,
				force: 'wpcom',
			};
		} else {
			Dispatcher.handleViewAction( {
				type: 'FETCH_EMBEDS',
				siteId: siteId,
			} );
		}

		siteHandle.embeds( args, function( error, data ) {
			if ( url ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_EMBED',
					siteId: siteId,
					url: url,
					data: data,
					error: error,
				} );
			} else {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_EMBEDS',
					siteId: siteId,
					embeds: data ? data.embeds : null,
					error: error,
				} );
			}
		} );
	},
};

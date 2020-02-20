/**
 * External dependencies
 */

import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wordads:actions' );

const WordadsActions = {
	fetchSettings: site => {
		debug( 'WordAds Actions fetchSettings', site );
		Dispatcher.handleViewAction( {
			type: 'FETCHING_WORDADS_SETTINGS',
			site: site,
		} );

		wpcom
			.site( site.ID )
			.wordAds()
			.settings()
			.get( ( error, data ) => {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_WORDADS_SETTINGS',
					site: site,
					error: error,
					data: data,
				} );
			} );
	},

	updateSettings: ( site, settings ) => {
		debug( 'WordAds Actions updateSettings', site );
		if ( site.capabilities && site.capabilities.manage_options ) {
			Dispatcher.handleViewAction( {
				type: 'UPDATING_WORDADS_SETTINGS',
				site: site,
			} );

			wpcom
				.site( site.ID )
				.wordAds()
				.settings()
				.update( settings, ( error, data ) => {
					Dispatcher.handleServerAction( {
						type: 'UPDATED_WORDADS_SETTINGS',
						site: site,
						error: error,
						data: data,
					} );
				} );
		}
	},
};

export default WordadsActions;

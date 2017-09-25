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

	fetchEarnings: ( site ) => {
		debug( 'WordAds Actions fetchEarnings', site );
		if ( site.capabilities && site.capabilities.manage_options ) {
			Dispatcher.handleViewAction( {
				type: 'FETCHING_EARNINGS',
				site: site
			} );

			wpcom.site( site.ID ).wordAds().earnings().get( ( error, data ) => {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_EARNINGS',
					site: site,
					error: error,
					data: data
				} );
			} );
		}
	},

	fetchSettings: ( site ) => {
		debug( 'WordAds Actions fetchSettings', site );
		Dispatcher.handleViewAction( {
			type: 'FETCHING_WORDADS_SETTINGS',
			site: site
		} );

		wpcom.site( site.ID ).wordAds().settings().get( ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_WORDADS_SETTINGS',
				site: site,
				error: error,
				data: data
			} );
		} );
	},

	updateSettings: ( site, settings ) => {
		debug( 'WordAds Actions updateSettings', site );
		if ( site.capabilities && site.capabilities.manage_options ) {
			Dispatcher.handleViewAction( {
				type: 'UPDATING_WORDADS_SETTINGS',
				site: site
			} );

			wpcom.site( site.ID ).wordAds().settings().update( settings, ( error, data ) => {
				Dispatcher.handleServerAction( {
					type: 'UPDATED_WORDADS_SETTINGS',
					site: site,
					error: error,
					data: data
				} );
			} );
		}
	},

	fetchTos: ( site ) => {
		debug( 'WordAds Actions fetchTos', site );
		Dispatcher.handleViewAction( {
			type: 'FETCHING_WORDADS_TOS',
			site: site
		} );

		wpcom.site( site.ID ).wordAds().tos().get( ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_WORDADS_TOS',
				site: site,
				error: error,
				data: data
			} );
		} );
	},

	signTos: ( site ) => {
		debug( 'WordAds Actions signTos', site );
		if ( site.capabilities && site.capabilities.manage_options ) {
			Dispatcher.handleViewAction( {
				type: 'SIGNING_WORDADS_TOS',
				site: site
			} );

			wpcom.site( site.ID ).wordAds().tos().sign( ( error, data ) => {
				Dispatcher.handleServerAction( {
					type: 'SIGN_WORDADS_TOS',
					site: site,
					error: error,
					data: data
				} );
			} );
		}
	}
};

export default WordadsActions;

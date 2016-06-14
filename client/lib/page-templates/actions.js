/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:page-templates:actions' );

/**
 * Internal dependencies
 */
const Dispatcher = require( 'dispatcher' ),
	PageTemplatesStore = require( './store' ),
	wpcom = require( 'lib/wp' );

const PageTemplatesActions = {
	fetchPageTemplates: siteId => {
		if ( PageTemplatesStore.isFetchingPageTemplates( siteId ) ) {
			debug( 'already fetching pageTemplates', siteId );
			return;
		}
		debug( 'fetching pageTemplates', siteId );
		Dispatcher.handleViewAction( {
			type: 'FETCHING_PAGE_TEMPLATES',
			siteId: siteId
		} );
		wpcom.site( siteId ).pageTemplates( {}, ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_PAGE_TEMPLATES',
				siteId: siteId,
				data: data,
				error: error
			} );
		} );
	},
};

module.exports = PageTemplatesActions;

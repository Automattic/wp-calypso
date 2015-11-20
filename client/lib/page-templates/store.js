/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';

/**
 * Module variables
 */
let _fetchingPageTemplates = {},
	_pageTemplatesBySite = {},
	_initialized = {};

const debug = debugModule( 'calypso:page-templates:store' );

let PageTemplatesStore = {
	getPageTemplates: siteId => _pageTemplatesBySite[ siteId ] || [],
	isFetchingPageTemplates: siteId => _fetchingPageTemplates[ siteId ],
	isInitialized: siteId => _initialized[ siteId ],
	emitChange: () => this.emit( 'change' )
};

function storePageTemplates( siteId, pageTemplates ) {
	_pageTemplatesBySite[ siteId ] = pageTemplates;
}

PageTemplatesStore.dispatchToken = Dispatcher.register( ( payload ) => {
	let action = payload.action;

	switch ( action.type ) {
		case 'FETCHING_PAGE_TEMPLATES':
			debug( 'fetching pageTemplates', action.siteId );
			_fetchingPageTemplates[ action.siteId ] = true;
			PageTemplatesStore.emitChange();
			break;
		case 'RECEIVE_PAGE_TEMPLATES':
			debug( 'pageTemplates received', action.siteId );
			_fetchingPageTemplates[ action.siteId ] = false;
			_initialized[ action.siteId ] = true;
			if ( ! action.error ) {
				storePageTemplates( action.siteId, action.data.templates );
			}
			PageTemplatesStore.emitChange();
			break;
	}
} );

emitter( PageTemplatesStore );

module.exports = PageTemplatesStore;

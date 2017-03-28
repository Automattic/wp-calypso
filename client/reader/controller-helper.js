/**
 * External Dependencies
 */
 import moment from 'moment';
 import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import { recordTrack } from 'reader/stats';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { fetchNextPage } from 'lib/feed-stream-store/actions';
import feedStreamFactory from 'lib/feed-stream-store';

let storeId;
export function setLastStoreId( id ) {
	storeId = id;
}

export function getLastStore() {
	if ( storeId ) {
		return feedStreamFactory( storeId );
	}
	return null;
}

export function ensureStoreLoading( store, context ) {
	if ( store.getPage() === 1 ) {
		if ( context && context.query && context.query.at ) {
			const startDate = moment( context.query.at );
			if ( startDate.isValid() ) {
				store.startDate = startDate.format();
			}
		}
		fetchNextPage( store.id );
	}
	return store;
}

export function trackPageLoad( path, title, readerView ) {
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( 'reader_views', readerView === 'full_post' ? readerView : readerView + '_load' );
}

export function trackScrollPage( path, title, category, readerView, pageNum ) {
	analytics.ga.recordEvent( category, 'Loaded Next Page', 'page', pageNum );
	recordTrack( 'calypso_reader_infinite_scroll_performed', {
		path: path,
		page: pageNum,
		section: readerView
	} );
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( {
		newdash_pageviews: 'scroll',
		reader_views: readerView + '_scroll'
	} );
}

export function trackUpdatesLoaded( key ) {
	analytics.mc.bumpStat( 'reader_views', key + '_load_new' );
	analytics.ga.recordEvent( 'Reader', 'Clicked Load New Posts', key );
	recordTrack( 'calypso_reader_load_new_posts', {
		section: key
	} );
}

export function setPageTitle( context, title ) {
	context.store.dispatch( setTitle( i18n.translate( '%s ‹ Reader', { args: title } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
}

export function userHasHistory( context ) {
	return !! context.lastRoute;
}

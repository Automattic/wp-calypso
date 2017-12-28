/** @format */

/**
 * External dependencies
 */

import EventEmitter from 'events/';
import { defer, uniqueId } from 'lodash';
/**
 * Internal dependencies
 */
import EmbedsListStore from 'client/lib/embeds/list-store';
import EmbedsStore from 'client/lib/embeds/store';
import actions from 'client/lib/embeds/actions';
import EmbedView from './view';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { SELECTED_SITE_SUBSCRIBE, SELECTED_SITE_UNSUBSCRIBE } from 'client/state/action-types';

export default class EmbedViewManager extends EventEmitter {
	constructor() {
		super();

		this.sitesListener = this.updateSite.bind( this );
	}

	onChange() {
		this.emit( 'change' );
		this.fetchSiteEmbeds();
	}

	updateSite( selectedSiteId ) {
		const siteId = selectedSiteId || getSelectedSiteId( this.store.getState() );

		if ( ! this.hasOwnProperty( 'siteId' ) ) {
			// First update (after adding initial listener) should trigger a
			// fetch, but not emit a change event
			this.siteId = siteId;
			this.fetchSiteEmbeds();
		} else if ( this.siteId !== siteId ) {
			// Subsequent updates should neither emit a change nor trigger a
			// fetch unless the site has changed
			this.siteId = siteId;
			this.onChange();
		}
	}

	addListener( event, listener, store ) {
		super.addListener( event, listener );
		if ( 'change' === event && 1 === this.listeners( event ).length ) {
			this.store = store;
			this.selectedSiteSubscriberId = uniqueId();
			store.dispatch( {
				type: SELECTED_SITE_SUBSCRIBE,
				listener: this.sitesListener,
			} );
			this.embedsListListener = EmbedsListStore.addListener( this.onChange.bind( this ) );
			this.embedsListener = EmbedsStore.addListener( this.onChange.bind( this ) );
			this.updateSite();
		}
	}

	removeListener( event, listener ) {
		super.removeListener( event, listener );

		if ( 'change' === event && ! this.listeners( event ).length ) {
			this.store.dispatch( {
				type: SELECTED_SITE_UNSUBSCRIBE,
				listener: this.sitesListener,
			} );
			if ( this.embedsListListener ) {
				this.embedsListListener.remove();
			}

			if ( this.embedsListener ) {
				this.embedsListener.remove();
			}
		}
	}

	fetchSiteEmbeds() {
		if ( this.siteId && ! EmbedsListStore.get( this.siteId ) ) {
			actions.fetch( this.siteId );
		}
	}

	fetchEmbed( url ) {
		// Only make a single attempt to fetch the embed, assuming that errors
		// are intentional if the service chooses not to support the specific
		// URL pattern. An unset status indicates an attempt is yet to be made.
		if ( this.siteId && ! EmbedsStore.get( url ).status ) {
			actions.fetch( this.siteId, url );
		}
	}

	match( content ) {
		if ( ! this.siteId ) {
			return;
		}

		const list = EmbedsListStore.get( this.siteId );
		if ( ! list || 'LOADED' !== list.status ) {
			return;
		}

		const rxLink = /(^|<p>)(https?:\/\/[^\s"]+?)(<\/p>\s*|$)/gi;
		let currentMatch;
		while ( ( currentMatch = rxLink.exec( content ) ) ) {
			const url = currentMatch[ 2 ];

			// Disregard URL if it's not a supported embed pattern for the site
			const isMatchingPattern = list.embeds.some( pattern => pattern.test( url ) );
			if ( ! isMatchingPattern ) {
				continue;
			}

			// Disregard URL if we've not yet retrieved the embed result, or if
			// the embed result is an error
			const embed = EmbedsStore.get( url );
			if ( ! embed.body ) {
				defer( () => this.fetchEmbed( url ) );
				continue;
			}

			return {
				index: currentMatch.index + currentMatch[ 1 ].length,
				content: url,
			};
		}
	}

	serialize( content ) {
		return encodeURIComponent( content );
	}

	getComponent() {
		return EmbedView;
	}

	edit( editor, content ) {
		editor.execCommand( 'embedDialog', content );
	}
}

/**
 * External dependencies
 */
import EventEmitter from 'events/';

/**
 * Internal dependencies
 */
import EmbedsListStore from 'lib/embeds/list-store';
import actions from 'lib/embeds/actions';
import _sites from 'lib/sites-list';
import EmbedView from './view';

/**
 * Module variables
 */
const sites = _sites();

export default class EmbedViewManager extends EventEmitter {
	constructor() {
		super();

		this.sitesListener = this.updateSite.bind( this );
	}

	onChange() {
		this.emit( 'change' );
		this.fetch();
	}

	updateSite() {
		const siteId = ( sites.getSelectedSite() || {} ).ID;

		if ( ! this.hasOwnProperty( 'siteId' ) ) {
			// First update (after adding initial listener) should trigger a
			// fetch, but not emit a change event
			this.siteId = siteId;
			this.fetch();
		} else if ( this.siteId !== siteId ) {
			// Subsequent updates should neither emit a change nor trigger a
			// fetch unless the site has changed
			this.siteId = siteId;
			this.onChange();
		}
	}

	addListener( event, listener ) {
		super.addListener( event, listener );

		if ( 'change' === event && 1 === this.listeners( event ).length ) {
			sites.addListener( event, this.sitesListener );
			this.listListener = EmbedsListStore.addListener( this.onChange.bind( this ) );
			this.updateSite();
		}
	}

	removeListener( event, listener ) {
		super.removeListener( event, listener );

		if ( 'change' === event && ! this.listeners( event ).length ) {
			sites.removeListener( event, this.sitesListener );

			if ( this.listListener ) {
				this.listListener.remove();
			}
		}
	}

	fetch() {
		if ( this.siteId && ! EmbedsListStore.get( this.siteId ) ) {
			actions.fetch( this.siteId );
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
		let match;
		while ( ( match = rxLink.exec( content ) ) ) {
			const isMatchingPattern = list.embeds.some( ( pattern ) => pattern.test( match[ 2 ] ) );
			if ( isMatchingPattern ) {
				return {
					index: match.index + match[ 1 ].length,
					content: match[ 2 ]
				};
			}
		}
	}

	serialize( content ) {
		return encodeURIComponent( content );
	}

	getComponent() {
		return EmbedView;
	}
}

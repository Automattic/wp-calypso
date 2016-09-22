/**
 * Module dependencies.
 */
import EventEmitter from 'events/';
import wpcom from 'lib/wp';

const debug = require( 'debug' )( 'calypso:tinymce:mentions' );

export default class Client extends EventEmitter {
	constructor() {
		super();
	}

	getUsersSuggestions( siteId ) {
		const key = 'suggestions-' + siteId;

		if ( ! this.suggestions ) {
			this.suggestions = {};
		}

		if ( this.suggestions[ key ] ) {
			return;
		}

		this.suggestions[ key ] = [];
		this.emit( 'loading' );

		try {
			if ( null != sessionStorage.getItem( key ) ) {
				const newSuggestions = JSON.parse( sessionStorage.getItem( key ) );

				this.suggestions[ key ] = newSuggestions;
				this.emit( 'loadingDone', this.suggestions[ key ] );

				return;
			}
		} catch ( e ) {
			debug( "couldn't get sessionStorage item for: %s", key );
		}

		wpcom.undocumented().userSuggestions().get(
			{
				site_id: siteId
			},

			function( err, data ) {
				if ( ! err ) {
					// Create a composite index to search against of; username + real name
					// This will also determine ordering of results, so username matches will appear on top

					const newSuggestions = data.suggestions;

					newSuggestions.forEach( function( suggestion ) {
						suggestion.name = suggestion.name || suggestion.user_login + ' ' + suggestion.display_name;
					} );

					this.suggestions[ key ] = newSuggestions;

					try {
						sessionStorage.setItem( key, JSON.stringify( newSuggestions ) );
					} catch ( e ) {
						debug( "couldn't set sessionStorage item for: %s", key );
					}
				}

				this.emit( 'loadingDone', this.suggestions[ key ] );
			}.bind( this )

		);
	}
}

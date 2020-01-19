/**
 * External dependencies
 */

import { ReduceStore } from 'flux/utils';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';

/**
 * Module variables
 */
const REGEXP_NAMED_CAPTURE_GROUP = /\(\?P?<([\w$]+)>/g;
const REGEXP_PCRE_REGEXP = /^([^\w\s\\])(.*)([^\w\s\\])([gim])?$/;

class EmbedsListStore extends ReduceStore {
	getInitialState() {
		return {};
	}

	get( siteId ) {
		return this.getState()[ siteId ];
	}

	reduce( state, action ) {
		action = action.action;

		switch ( action.type ) {
			case 'FETCH_EMBEDS':
				state = Object.assign( {}, state, {
					[ action.siteId ]: {
						status: 'LOADING',
					},
				} );
				break;

			case 'RECEIVE_EMBEDS':
				if ( action.error ) {
					state = Object.assign( {}, state, {
						[ action.siteId ]: {
							status: 'ERROR',
						},
					} );
				} else {
					// Normalize PCRE patterns into an array of RegExp objects
					// See: http://php.net/manual/en/reference.pcre.pattern.syntax.php
					// 'http://example.com/*'     -> new RegExp( 'http://example.com/*' );
					// '#http://example.com/*#i'  -> new RegExp( 'http://example.com/*', 'i' );
					// '\/http://example.com/*\/' -> new RegExp( 'http://example.com/*' );
					const embeds = action.embeds
						.map( embed => {
							// Named capture groups aren't supported in JavaScript
							// See: https://github.com/slevithan/xregexp/blob/11362f53/src/xregexp.js#L1840
							embed = embed.replace( REGEXP_NAMED_CAPTURE_GROUP, '(' );

							const match = embed.match( REGEXP_PCRE_REGEXP );
							if ( match && match[ 1 ] === match[ 3 ] ) {
								return new RegExp( match[ 2 ], match[ 4 ] );
							}

							try {
								return new RegExp( embed );
							} catch ( e ) {
								return false;
							}
						} )
						.filter( Boolean );

					state = Object.assign( {}, state, {
						[ action.siteId ]: {
							status: 'LOADED',
							embeds: embeds,
						},
					} );
				}
				break;
		}

		return state;
	}
}

export default new EmbedsListStore( Dispatcher );

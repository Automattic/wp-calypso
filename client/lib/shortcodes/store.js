/**
 * External dependencies
 */
import { ReduceStore } from 'flux/utils';
import { intersection, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { ActionTypes, LoadStatus } from './constants';
import Dispatcher from 'dispatcher';
import Shortcode from 'lib/shortcode';

class ShortcodesStore extends ReduceStore {
	getInitialState() {
		return {};
	}

	get( siteId, shortcode ) {
		const state = this.getState();

		if ( ! state[ siteId ] || ! state[ siteId ][ shortcode ] ) {
			return;
		}

		return state[ siteId ][ shortcode ];
	}

	reduce( state, action ) {
		action = action.action;

		switch ( action.type ) {
			case ActionTypes.FETCH_SHORTCODE:
				state = Object.assign( {}, state, {
					[ action.payload.siteId ]: Object.assign( {}, state[ action.payload.siteId ], {
						[ action.payload.shortcode ]: {
							status: LoadStatus.LOADING
						}
					} )
				} );
				break;

			case ActionTypes.RECEIVE_SHORTCODE:
				state = Object.assign( {}, state, {
					[ action.payload.siteId ]: Object.assign( {}, state[ action.payload.siteId ], {
						[ action.payload.shortcode ]: {
							status: action.error ? LoadStatus.ERROR : LoadStatus.LOADED
						}
					} )
				} );

				if ( ! action.error ) {
					Object.assign( state[ action.payload.siteId ][ action.payload.shortcode ], {
						body: action.payload.data.result,
						scripts: action.payload.data.scripts,
						styles: action.payload.data.styles
					} );
				}
				break;

			/**
			 * When a media item or set of items is updated, we iterate over
			 * the set of known shortcodes for the site, and "forget" any
			 * shortcode results for galleries which contain the updated item.
			 */
			case 'RECEIVE_MEDIA_ITEMS':
			case 'RECEIVE_MEDIA_ITEM':
				if ( ! state.hasOwnProperty( action.siteId ) ) {
					break;
				}

				let media;
				if ( Array.isArray( action.data.media ) ) {
					media = action.data.media;
				} else {
					media = [ action.data ];
				}

				const updatedIds = media.map( ( item ) => item.ID.toString() );

				state = Object.assign( {}, state, {
					[ action.siteId ]: pickBy( state[ action.siteId ], ( status, shortcode ) => {
						const parsed = Shortcode.parse( shortcode );
						if ( parsed.tag !== 'gallery' || ! parsed.attrs.named || ! parsed.attrs.named.ids ) {
							return true;
						}

						const ids = parsed.attrs.named.ids.split( ',' );
						return ! intersection( ids, updatedIds ).length;
					} )
				} );
				break;
		}

		return state;
	}
}

export default new ShortcodesStore( Dispatcher );

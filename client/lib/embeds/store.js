/**
 * External dependencies
 */
import { ReduceStore } from 'flux/utils';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';

class PostEditEmbedsStore extends ReduceStore {

	getInitialState() {
		return {};
	}

	get( url ) {
		const embedState = this.getState()[ url ];
		return embedState ? embedState : {};
	}

	reduce( state, action ) {
		action = action.action;
		switch ( action.type ) {
			case 'STOP_EDITING_POST':
				state = {};
				break;

			case 'FETCH_EMBED':
				state = Object.assign( {}, state, {
					[action.url]: {
						status: 'LOADING'
					}
				} );
				break;

			case 'RECEIVE_EMBED':
				if ( action.error ) {
					state = Object.assign( {}, state, {
						[action.url]: {
							status: 'ERROR'
						}
					} );
				} else {
					state = Object.assign( {}, state, {
						[action.url]: {
							status: 'LOADED',
							body: action.body
						}
					} );
				}
				break;
		}

		return state;
	}
}

export default new PostEditEmbedsStore( Dispatcher );

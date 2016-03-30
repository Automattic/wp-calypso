/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
	SERVER_DESERIALIZE,
	THEMES_INCREMENT_PAGE,
	THEMES_QUERY
} from 'state/action-types';

export const initialState = fromJS( {
	previousSiteId: 0,
	currentSiteId: null,
	isJetpack: null,
	lastParams: null
} );

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case THEMES_QUERY:
			return state.set( 'lastParams', action.params );
		case THEMES_INCREMENT_PAGE:
			return state
				.set( 'previousSiteId', state.get( 'currentSiteId' ) )
				.set( 'currentSiteId', action.site.ID )
				.set( 'isJetpack', !! action.site.jetpack );
		case DESERIALIZE:
			return initialState;
		case SERVER_DESERIALIZE:
			return fromJS( state );
		case SERIALIZE:
			return {};
	}

	return state;
};

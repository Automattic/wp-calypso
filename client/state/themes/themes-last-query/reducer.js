/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import ActionTypes from '../action-types';
import { FROM_OBJECT, TO_OBJECT } from 'state/action-types';

const initialState = fromJS( {
	previousSiteId: 0,
	currentSiteId: null,
	isJetpack: null,
	lastParams: null
} );

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case ActionTypes.QUERY_THEMES:
			return state.set( 'lastParams', action.params );

		case ActionTypes.INCREMENT_THEMES_PAGE:
			return state
				.set( 'previousSiteId', state.get( 'currentSiteId' ) )
				.set( 'currentSiteId', action.site.ID )
				.set( 'isJetpack', !! action.site.jetpack );
		case FROM_OBJECT:
			return fromJS( state );
		case TO_OBJECT:
			return state.toJS();
	}

	return state;
};

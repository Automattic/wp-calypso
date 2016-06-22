/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_DISMISS,
	FIRST_VIEW_SHOW,
} from 'state/action-types';

export function firstView( state = { dismissed: [], visible: [] }, action ) {
	switch ( action.type ) {

		case FIRST_VIEW_DISMISS:
			if ( -1 === state.dismissed.indexOf( action.view ) ) {
				return Object.assign( {}, state, { dismissed: state.dismissed.concat( action.view ) } );
			}
			return state;

		case FIRST_VIEW_SHOW:
			const filteredViews = action.views.filter( view => {
				const isDismissed = ( -1 !== state.dismissed.indexOf( view ) ),
					isVisible = ( -1 !== state.visible.indexOf( view ) );

				if ( isVisible ) {
					// We don't want duplicates. The view is already visible.
					return false;
				}

				// If action.force is set, we show regardless of dismissed state.
				return action.force || ! isDismissed;
			} );

			return Object.assign( {}, state, { visible: state.visible.concat( filteredViews ) } );

	}
	return state;
}

export default firstView;

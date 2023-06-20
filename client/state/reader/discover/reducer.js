import { READER_DISCOVER_SET_NAVIGATION_TAB } from 'calypso/state/reader/action-types';

export const discover = ( state = { selectedTab: 'recommended' }, action ) => {
	switch ( action.type ) {
		case READER_DISCOVER_SET_NAVIGATION_TAB:
			return {
				...state,
				selectedTab: action.payload.tagSlug,
			};
	}

	return state;
};

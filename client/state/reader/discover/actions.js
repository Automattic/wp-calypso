import { READER_DISCOVER_SET_NAVIGATION_TAB } from 'calypso/state/reader/action-types';

export function setSelectedDiscoverNavTab( tagSlug ) {
	// return ( dispatch ) => {
	// 	dispatch( {
	// 		type: READER_DISCOVER_SET_NAVIGATION_TAB,
	// 		payload: {
	// 			tagSlug,
	// 		},
	// 	} );
	// };
	return {
		type: READER_DISCOVER_SET_NAVIGATION_TAB,
		payload: {
			tagSlug,
		},
	};
}

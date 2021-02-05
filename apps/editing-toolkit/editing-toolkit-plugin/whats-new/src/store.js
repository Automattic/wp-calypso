/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

const DEFAULT_STATE = {
	whatsNew: false,
};

const actions = {
	toggleWhatsNew: () => ( {
		type: 'TOGGLE_FEATURE',
	} ),
};

const selectors = {
	isWhatsNewActive: ( state ) => state.whatsNew,
};

function reducer( state = DEFAULT_STATE, action ) {
	switch ( action.type ) {
		case 'TOGGLE_FEATURE':
			return {
				whatsNew: ! state.whatsNew,
			};
	}
	return state;
}

registerStore( 'automattic/whats-new', {
	reducer,
	actions,
	selectors,
} );

/**
 * External dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

const DEFAULT_STATE = {
	whatsNew: false,
};

const actions = {
	toggleWhatsNew() {
		return {
			type: 'TOGGLE_FEATURE',
		};
	},
};

const store = createReduxStore( 'whats-new', {
	reducer( state = DEFAULT_STATE, action ) {
		switch ( action.type ) {
			case 'TOGGLE_FEATURE':
				return {
					whatsNew: ! state.whatsNew,
				};
		}
		return state;
	},
	actions,
	selectors: {
		isWhatsNewActive( state ) {
			return state.whatsNew;
		},
	},
} );

register( store );

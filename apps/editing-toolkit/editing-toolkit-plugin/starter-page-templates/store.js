/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

const reducer = ( state = 'CLOSED', { type, ...action } ) =>
	'SET_IS_OPEN' === type ? action.openState : state;

const actions = {
	setOpenState: ( openState ) => ( {
		type: 'SET_IS_OPEN',
		openState: openState || 'CLOSED',
	} ),
};

const selectors = {
	isOpen: ( state ) => 'CLOSED' !== state,
	isPromptedFromSidebar: ( state ) => 'OPEN_FROM_SIDEBAR' === state,
};

registerStore( 'automattic/starter-page-layouts', {
	reducer,
	actions,
	selectors,
} );

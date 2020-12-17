/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

const reducer = ( state = { isOpen: false, isPromptedFromSidebar: false }, { type, ...action } ) =>
	'SET_IS_OPEN' === type
		? { ...state, isOpen: action.isOpen, isPromptedFromSidebar: action.isPromptedFromSidebar }
		: state;

const actions = {
	setIsOpen: ( isOpen, isPromptedFromSidebar ) => ( {
		type: 'SET_IS_OPEN',
		isOpen,
		isPromptedFromSidebar: !! isPromptedFromSidebar,
	} ),
};

const selectors = {
	isOpen: ( state ) => state.isOpen,
	isPromptedFromSidebar: ( state ) => state.isPromptedFromSidebar,
};

registerStore( 'automattic/starter-page-layouts', {
	reducer,
	actions,
	selectors,
} );

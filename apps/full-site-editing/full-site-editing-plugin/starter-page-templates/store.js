/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

const reducer = ( state = { isOpen: false }, { type, ...action } ) =>
	'SET_IS_OPEN' === type ? { ...state, isOpen: action.isOpen } : state;

const actions = {
	setIsOpen: ( isOpen ) => ( {
		type: 'SET_IS_OPEN',
		isOpen,
	} ),
};

const selectors = {
	isOpen: ( state ) => state.isOpen,
};

registerStore( 'automattic/starter-page-layouts', {
	reducer,
	actions,
	selectors,
} );

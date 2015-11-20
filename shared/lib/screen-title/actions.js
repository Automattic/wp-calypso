/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';

/**
 * Internal dependencies
 */
import { actionTypes } from './constants';
import { TitleStore } from './store.js'; // eslint-disable-line no-unused-vars

/**
 * Module variables
 */
const TitleActions = {
	setTitle( title, options = {} ) {
		setTimeout( function() {
			Dispatcher.handleViewAction( {
				type: actionTypes.SET_TITLE,
				title,
				options
			} );
		}, 0 );
	},

	setCount( count ) {
		setTimeout( function() {
			Dispatcher.handleViewAction( {
				type: actionTypes.SET_COUNT,
				count
			} )
		}, 0 );
	}
};

export default TitleActions;

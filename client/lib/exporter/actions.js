/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
const wpcom = require( 'lib/wp' ).undocumented();

/**
 * Internal dependencies
 */
import { actionTypes } from './constants';

export function toggleAdvancedSettings() {
	Dispatcher.handleViewAction( {
		type: actionTypes.TOGGLE_ADVANCED_SETTINGS
	} );
}

export function toggleSection( section ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.TOGGLE_SECTION,
		section: section
	} );
}

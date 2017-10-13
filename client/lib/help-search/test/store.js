/** @format */
/**
 * Internal dependencies
 */
import actions from './lib/mock-actions';
import { assert } from 'chai';

describe( 'Help search Store', () => {
	var Dispatcher, HelpSearchStore;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		HelpSearchStore = require( 'lib/help-search/store' );
	} );

	describe( 'Get Help Links', () => {
		test( 'Should return empty array when there are no help links', () => {
			var helpLinks = HelpSearchStore.getHelpLinks();

			assert( Array.isArray( helpLinks ), 'help links is not an array' );
			assert( 0 === helpLinks.length, 'help links is empty' );
		} );

		test( 'Should return an array of help link when there are help links', () => {
			var helpLinks;

			Dispatcher.handleServerAction( actions.fetchedHelpLinks );
			helpLinks = HelpSearchStore.getHelpLinks();

			assert( Array.isArray( helpLinks ), 'help links is not an array' );
			assert.isObject( helpLinks[ 0 ] );
		} );
	} );
} );

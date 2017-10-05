/** @format */
/**
 * Internal dependencies
 */
import actions from './lib/mock-actions';
import { assert } from 'chai';

describe( 'Help search Store', function() {
	var Dispatcher, HelpSearchStore;

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		HelpSearchStore = require( 'lib/help-search/store' );
	} );

	describe( 'Get Help Links', function() {
		it( 'Should return empty array when there are no help links', function() {
			var helpLinks = HelpSearchStore.getHelpLinks();

			assert( Array.isArray( helpLinks ), 'help links is not an array' );
			assert( 0 === helpLinks.length, 'help links is empty' );
		} );

		it( 'Should return an array of help link when there are help links', function() {
			var helpLinks;

			Dispatcher.handleServerAction( actions.fetchedHelpLinks );
			helpLinks = HelpSearchStore.getHelpLinks();

			assert( Array.isArray( helpLinks ), 'help links is not an array' );
			assert.isObject( helpLinks[ 0 ] );
		} );
	} );
} );

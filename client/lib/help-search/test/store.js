/** @format */
/**
 * Internal dependencies
 */
import actions from './lib/mock-actions';

describe( 'Help search Store', () => {
	var Dispatcher, HelpSearchStore;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		HelpSearchStore = require( 'lib/help-search/store' );
	} );

	describe( 'Get Help Links', () => {
		test( 'Should return empty array when there are no help links', () => {
			var helpLinks = HelpSearchStore.getHelpLinks();

			expect( Array.isArray( helpLinks ) ).toBeTruthy();
			expect( 0 === helpLinks.length ).toBeTruthy();
		} );

		test( 'Should return an array of help link when there are help links', () => {
			var helpLinks;

			Dispatcher.handleServerAction( actions.fetchedHelpLinks );
			helpLinks = HelpSearchStore.getHelpLinks();

			expect( Array.isArray( helpLinks ) ).toBeTruthy();
			expect( typeof helpLinks[ 0 ] ).toBe( 'object' );
		} );
	} );
} );

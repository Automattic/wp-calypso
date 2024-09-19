/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

import { createActions } from '../actions';
import { currentUser } from '../reducer';

const { receiveCurrentUser, receiveCurrentUserFailed } = createActions();

describe( 'currentUser', () => {
	it( 'defaults to undefined', () => {
		const state = currentUser( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toBe( undefined );
	} );

	it( 'returns a current user object', () => {
		const testUser = {
			ID: 1,
			username: 'testusername',
			display_name: 'testusername',
			language: 'en',
			locale_variant: '',
		};
		const state = currentUser( undefined, receiveCurrentUser( testUser ) );
		expect( state ).toEqual( testUser );
	} );

	it( 'returns null if receiving the current user failed', () => {
		const state = currentUser( undefined, receiveCurrentUserFailed() );
		expect( state ).toBe( null );
	} );
} );

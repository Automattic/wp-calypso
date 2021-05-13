/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isFetchingPreferences, getPreference, hasReceivedRemotePreferences } from '../selectors';

describe( 'selectors', () => {
	describe( 'isFetchingPreferences()', () => {
		test( 'should return preferences fetching status', () => {
			const state = { preferences: { fetching: true } };
			expect( isFetchingPreferences( state ) ).to.equal( true );
		} );
	} );

	describe( 'getPreference()', () => {
		test( 'should return null if none of local, remote, or default values contains key', () => {
			const preference = getPreference(
				{
					preferences: {
						localValues: {},
						remoteValues: {},
					},
				},
				'__unknown'
			);

			expect( preference ).to.be.null;
		} );

		test( 'should return a default value if neither local nor remote values contain key', () => {
			const preference = getPreference(
				{
					preferences: {
						localValues: {},
						remoteValues: {},
					},
				},
				'mediaModalGalleryInstructionsDismissed'
			);

			expect( preference ).to.be.false;
		} );

		test( 'should return the remote value if local does not contain key', () => {
			const preference = getPreference(
				{
					preferences: {
						localValues: {},
						remoteValues: {
							foo: 'baz',
						},
					},
				},
				'foo'
			);

			expect( preference ).to.equal( 'baz' );
		} );

		test( 'should prefer a local value over remote or default values', () => {
			const preference = getPreference(
				{
					preferences: {
						localValues: {
							foo: 'qux',
						},
						remoteValues: {
							foo: 'baz',
						},
					},
				},
				'foo'
			);

			expect( preference ).to.equal( 'qux' );
		} );
	} );

	describe( 'hasReceivedRemotePreferences()', () => {
		test( 'should return false if preferences have not yet been received', () => {
			const hasReceived = hasReceivedRemotePreferences( {
				preferences: {
					remoteValues: null,
				},
			} );

			expect( hasReceived ).to.be.false;
		} );

		test( 'should return false if preferences have been received', () => {
			const hasReceived = hasReceivedRemotePreferences( {
				preferences: {
					remoteValues: {},
				},
			} );

			expect( hasReceived ).to.be.true;
		} );
	} );
} );

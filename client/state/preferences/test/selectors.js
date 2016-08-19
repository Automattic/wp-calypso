/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchingPreferences, getPreference } from '../selectors';

describe( 'selectors', () => {
	describe( '#fetchingPreferences()', () => {
		it( 'should return preferences fetching status', () => {
			const state = {	preferences: { fetching: true } };
			expect( fetchingPreferences( state ) ).to.equal( true );
		} );
	} );

	describe( 'getPreference()', () => {
		it( 'should return null if none of local, remote, or default values contains key', () => {
			const preference = getPreference( {
				preferences: {
					localValues: {},
					remoteValues: {}
				}
			}, '__unknown' );

			expect( preference ).to.be.null;
		} );

		it( 'should return a default value if neither local nor remote values contain key', () => {
			const preference = getPreference( {
				preferences: {
					localValues: {},
					remoteValues: {}
				}
			}, 'mediaModalGalleryInstructionsDismissed' );

			expect( preference ).to.be.false;
		} );

		it( 'should return the remote value if local does not contain key', () => {
			const preference = getPreference( {
				preferences: {
					localValues: {},
					remoteValues: {
						foo: 'baz'
					}
				}
			}, 'foo' );

			expect( preference ).to.equal( 'baz' );
		} );

		it( 'should prefer a local value over remote or default values', () => {
			const preference = getPreference( {
				preferences: {
					localValues: {
						foo: 'qux'
					},
					remoteValues: {
						foo: 'baz'
					}
				}
			}, 'foo' );

			expect( preference ).to.equal( 'qux' );
		} );
	} );
} );

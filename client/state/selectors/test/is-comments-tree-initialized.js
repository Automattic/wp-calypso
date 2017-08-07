/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isCommentsTreeInitialized } from 'state/selectors';

describe( 'isCommentsTreeInitialized()', () => {
	it( 'should return false if no data is available', () => {
		expect( isCommentsTreeInitialized( {}, 77203074, 'spam' ) ).to.equal( false );
	} );
	it( 'should return true if data is available', () => {
		const state = {
			comments: {
				treesInitialized: {
					77203074: { spam: true }
				}
			}
		};
		expect( isCommentsTreeInitialized( state, 77203074, 'spam' ) ).to.equal( true );
	} );
	it( 'should return false if no data is available for site', () => {
		const state = {
			comments: {
				treesInitialized: {
					2916284: { spam: true }
				}
			}
		};
		expect( isCommentsTreeInitialized( state, 77203074, 'spam' ) ).to.equal( false );
	} );
	it( 'should return false if no data is available for filter', () => {
		const state = {
			comments: {
				treesInitialized: {
					77203074: { spam: true }
				}
			}
		};
		expect( isCommentsTreeInitialized( state, 77203074, 'unapproved' ) ).to.equal( false );
	} );
} );

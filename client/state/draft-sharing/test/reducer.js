/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isEnabled, link } from '../reducer';
import {
	POST_SHARE_A_DRAFT_ADD,
	POST_SHARE_A_DRAFT_ENABLE,
	POST_SHARE_A_DRAFT_DISABLE,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( 'isEnabled', () => {
		it( 'sets initial state to false', () => {
			const initialState = isEnabled( undefined, { type: '@@calypso/INIT' } );
			expect( initialState ).to.be.false;
		} );

		it( 'adds draft sharing enabled state', () => {
			const stateA = isEnabled( false, {
				type: POST_SHARE_A_DRAFT_ADD,
				isEnabled: true,
			} );
			expect( stateA ).to.be.true;

			const stateB = isEnabled( false, {
				type: POST_SHARE_A_DRAFT_ADD,
				isEnabled: false,
			} );
			expect( stateB ).to.be.false;
		} );

		it( 'enables draft sharing', () => {
			const state = isEnabled( false, { type: POST_SHARE_A_DRAFT_ENABLE } );
			expect( state ).to.be.true;
		} );

		it( 'disables draft sharing', () => {
			const state = isEnabled( true, { type: POST_SHARE_A_DRAFT_DISABLE } );
			expect( state ).to.be.false;
		} );
	} );

	describe( 'link', () => {
		it( 'sets initial state to the empty string', () => {
			const initialState = link( undefined, { type: '@@calypso/INIT' } );
			expect( initialState ).to.be.a( 'string' ).that.is.empty;
		} );

		it( 'adds draft sharing link state', () => {
			const state = link( '', {
				type: POST_SHARE_A_DRAFT_ADD,
				link: 'expected-link',
			} );
			expect( state ).to.equal( 'expected-link' );
		} );
	} );
} );

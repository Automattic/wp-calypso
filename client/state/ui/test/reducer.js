/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	TITLE_SET,
	SELECTED_SITE_SET,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { title, selectedSiteId } from '../reducer';

describe( 'reducer', () => {
	it( 'should refuse to persist any state', () => {
		const state = reducer( {
			selectedSiteId: 2916284
		}, { type: SERIALIZE } );

		expect( state ).to.eql( {} );
	} );

	it( 'should refuse to restore any persisted state', () => {
		const state = reducer( {
			selectedSiteId: 2916284
		}, { type: DESERIALIZE } );

		expect( state ).to.eql( {} );
	} );

	describe( '#title()', () => {
		it( 'should default to an empty string', () => {
			const state = title( undefined, {} );

			expect( state ).to.equal( '' );
		} );

		it( 'should track state as the assigned title', () => {
			const state = title( undefined, {
				type: TITLE_SET,
				title: 'Home'
			} );

			expect( state ).to.equal( 'Home' );
		} );
	} );

	describe( '#selectedSiteId()', () => {
		it( 'should default to null', () => {
			const state = selectedSiteId( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the selected site ID', () => {
			const state = selectedSiteId( null, {
				type: SELECTED_SITE_SET,
				siteId: 2916284
			} );

			expect( state ).to.equal( 2916284 );
		} );

		it( 'should set to null if siteId is undefined', () => {
			const state = selectedSiteId( null, {
				type: SELECTED_SITE_SET,
				siteId: undefined
			} );

			expect( state ).to.be.null;
		} );
	} );
} );

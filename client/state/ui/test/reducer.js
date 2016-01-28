/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SELECTED_SITE_SET, SERIALIZE, DESERIALIZE } from 'state/action-types';
import {
	selectedSiteId,
	recentlySelectedSiteIds,
	section,
	hasSidebar,
	isLoading,
	chunkName
} from '../reducer';

describe( 'reducer', () => {
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

		it( 'should not persist data because this is not implemented', () => {
			const state = selectedSiteId( 2916284, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( null );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = selectedSiteId( 2916284, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( null );
		} );
	} );

	describe( '#recentlySelectedSiteIds()', () => {
		it( 'should not persist data because this is not implemented', () => {
			const state = recentlySelectedSiteIds( [ 2916284 ], {
				type: SERIALIZE
			} );

			expect( state ).to.eql( [] );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = recentlySelectedSiteIds( [ 2916284 ], {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( [] );
		} );
	} );

	describe( '#section()', () => {
		it( 'should not persist data because this is not implemented', () => {
			const state = section( 'hello', {
				type: SERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = section( 'hello', {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( false );
		} );
	} );

	describe( '#hasSidebar()', () => {
		it( 'should not persist data because this is not implemented', () => {
			const state = hasSidebar( false, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( true );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = hasSidebar( false, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( true );
		} );
	} );

	describe( '#isLoading()', () => {
		it( 'should not persist data because this is not implemented', () => {
			const state = isLoading( true, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = isLoading( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( false );
		} );
	} );

	describe( '#chunkName()', () => {
		it( 'should not persist data because this is not implemented', () => {
			const state = chunkName( 'hello', {
				type: SERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = chunkName( 'hello', {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( false );
		} );
	} );
} );

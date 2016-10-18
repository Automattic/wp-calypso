/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { selectedSiteId } from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'section',
			'isLoading',
			'layoutFocus',
			'hasSidebar',
			'isPreviewShowing',
			'queryArguments',
			'selectedSiteId',
			'guidedTour',
			'editor',
			'reader',
			'olark',
			'preview',
			'actionLog',
			'happychat',
			'mediaModal'
		] );
	} );

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

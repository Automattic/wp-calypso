/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	PAGE_TEMPLATES_RECEIVE,
	PAGE_TEMPLATES_REQUEST,
	PAGE_TEMPLATES_REQUEST_FAILURE,
	PAGE_TEMPLATES_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { requesting, items } from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items'
		] );
	} );

	describe( 'requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set site ID to true value if request in progress', () => {
			const state = requesting( undefined, {
				type: PAGE_TEMPLATES_REQUEST,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const original = deepFreeze( {
				2916284: true
			} );
			const state = requesting( original, {
				type: PAGE_TEMPLATES_REQUEST,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true
			} );
		} );

		it( 'should set site ID to false if request finishes successfully', () => {
			const original = deepFreeze( {
				2916284: true
			} );
			const state = requesting( original, {
				type: PAGE_TEMPLATES_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'should set site ID to false if request finishes with failure', () => {
			const original = deepFreeze( {
				2916284: true
			} );
			const state = requesting( original, {
				type: PAGE_TEMPLATES_REQUEST_FAILURE,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'should not persist state', () => {
			const original = deepFreeze( {
				2916284: true
			} );
			const state = requesting( original, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const original = deepFreeze( {
				2916284: true
			} );
			const state = requesting( original, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track page templates by site ID', () => {
			const state = items( null, {
				type: PAGE_TEMPLATES_RECEIVE,
				siteId: 2916284,
				templates: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' }
				]
			} );

			expect( state ).to.eql( {
				2916284: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' }
				]
			} );
		} );

		it( 'should accumulate sites', () => {
			const original = deepFreeze( {
				2916284: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' }
				]
			} );
			const state = items( original, {
				type: PAGE_TEMPLATES_RECEIVE,
				siteId: 77203074,
				templates: [
					{ label: 'Full Width', file: 'fullwidth.php' }
				]
			} );

			expect( state ).to.eql( {
				2916284: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' }
				],
				77203074: [
					{ label: 'Full Width', file: 'fullwidth.php' },
				]
			} );
		} );

		it( 'should override previous page templates of same site ID', () => {
			const original = deepFreeze( {
				2916284: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' }
				]
			} );
			const state = items( original, {
				type: PAGE_TEMPLATES_RECEIVE,
				siteId: 2916284,
				templates: [
					{ label: 'Full Width', file: 'fullwidth.php' }
				]
			} );

			expect( state ).to.eql( {
				2916284: [
					{ label: 'Full Width', file: 'fullwidth.php' },
				]
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: [
					{ label: 'Full Width', file: 'fullwidth.php' },
				]
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: [
					{ label: 'Full Width', file: 'fullwidth.php' },
				]
			} );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: [
					{ label: 'Full Width', file: 'fullwidth.php' },
				]
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: [
					{ label: 'Full Width', file: 'fullwidth.php' },
				]
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: [
					{ label: 'Full Width' },
				]
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
			expect( console.warn ).to.have.been.calledOnce; // eslint-disable-line no-console
		} );
	} );
} );

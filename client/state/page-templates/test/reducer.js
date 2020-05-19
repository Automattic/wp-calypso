/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, items } from '../reducer';
import {
	PAGE_TEMPLATES_RECEIVE,
	PAGE_TEMPLATES_REQUEST,
	PAGE_TEMPLATES_REQUEST_FAILURE,
	PAGE_TEMPLATES_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'requesting', 'items' ] );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set site ID to true value if request in progress', () => {
			const state = requesting( undefined, {
				type: PAGE_TEMPLATES_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate requesting values', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: PAGE_TEMPLATES_REQUEST,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true,
			} );
		} );

		test( 'should set site ID to false if request finishes successfully', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: PAGE_TEMPLATES_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
			} );
		} );

		test( 'should set site ID to false if request finishes with failure', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: PAGE_TEMPLATES_REQUEST_FAILURE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
			} );
		} );

		test( 'should not persist state', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track page templates by site ID', () => {
			const state = items( null, {
				type: PAGE_TEMPLATES_RECEIVE,
				siteId: 2916284,
				templates: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' },
				],
			} );

			expect( state ).to.eql( {
				2916284: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' },
				],
			} );
		} );

		test( 'should accumulate sites', () => {
			const original = deepFreeze( {
				2916284: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' },
				],
			} );
			const state = items( original, {
				type: PAGE_TEMPLATES_RECEIVE,
				siteId: 77203074,
				templates: [ { label: 'Full Width', file: 'fullwidth.php' } ],
			} );

			expect( state ).to.eql( {
				2916284: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' },
				],
				77203074: [ { label: 'Full Width', file: 'fullwidth.php' } ],
			} );
		} );

		test( 'should override previous page templates of same site ID', () => {
			const original = deepFreeze( {
				2916284: [
					{ label: 'Full Width, No Sidebar', file: 'fullwidth-page.php' },
					{ label: 'Portfolio Page Template', file: 'portfolio-page.php' },
				],
			} );
			const state = items( original, {
				type: PAGE_TEMPLATES_RECEIVE,
				siteId: 2916284,
				templates: [ { label: 'Full Width', file: 'fullwidth.php' } ],
			} );

			expect( state ).to.eql( {
				2916284: [ { label: 'Full Width', file: 'fullwidth.php' } ],
			} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: [ { label: 'Full Width', file: 'fullwidth.php' } ],
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: [ { label: 'Full Width', file: 'fullwidth.php' } ],
			} );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: [ { label: 'Full Width', file: 'fullwidth.php' } ],
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: [ { label: 'Full Width', file: 'fullwidth.php' } ],
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: [ { label: 'Full Width' } ],
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );

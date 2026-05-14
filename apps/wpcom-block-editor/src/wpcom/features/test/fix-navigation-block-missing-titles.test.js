/**
 * @jest-environment jsdom
 */
import {
	normalizeTitle,
	normalizeEntityRecord,
	normalizeRestResponse,
} from '../fix-navigation-block-missing-titles';

jest.mock( '@wordpress/api-fetch', () => ( {
	use: jest.fn(),
} ) );

describe( 'fix-navigation-block-missing-titles', () => {
	describe( 'normalizeTitle', () => {
		it( 'normalizes null title to empty strings', () => {
			expect( normalizeTitle( null ) ).toEqual( { raw: '', rendered: '' } );
		} );

		it( 'normalizes undefined title to empty strings', () => {
			expect( normalizeTitle( undefined ) ).toEqual( { raw: '', rendered: '' } );
		} );

		it( 'normalizes title with null rendered/raw fields to empty strings', () => {
			expect( normalizeTitle( { raw: null, rendered: null } ) ).toEqual( {
				raw: '',
				rendered: '',
			} );
		} );

		it( 'preserves non-null title values unchanged', () => {
			const title = { raw: 'My Page', rendered: 'My Page' };
			expect( normalizeTitle( title ) ).toEqual( title );
		} );

		it( 'preserves extra fields on the title object', () => {
			const title = { raw: 'My Page', rendered: '<em>My Page</em>', protected: false };
			expect( normalizeTitle( title ) ).toEqual( title );
		} );
	} );

	describe( 'normalizeEntityRecord', () => {
		it( 'normalizes a record with null title', () => {
			const record = { id: 1, title: null };
			expect( normalizeEntityRecord( record ) ).toEqual( {
				id: 1,
				title: { raw: '', rendered: '' },
			} );
		} );

		it( 'does not modify records without a title field', () => {
			const record = { id: 1, content: 'something' };
			expect( normalizeEntityRecord( record ) ).toEqual( record );
		} );

		it( 'does not modify non-object values', () => {
			expect( normalizeEntityRecord( null ) ).toBeNull();
			expect( normalizeEntityRecord( undefined ) ).toBeUndefined();
			expect( normalizeEntityRecord( 'string' ) ).toBe( 'string' );
		} );

		it( 'preserves a record whose title is already a valid object', () => {
			const record = { id: 1, title: { raw: 'Hello', rendered: 'Hello' } };
			expect( normalizeEntityRecord( record ) ).toEqual( record );
		} );
	} );

	describe( 'normalizeRestResponse', () => {
		it( 'normalizes a single record with null title', () => {
			const record = { id: 1, title: null };
			expect( normalizeRestResponse( record ) ).toEqual( {
				id: 1,
				title: { raw: '', rendered: '' },
			} );
		} );

		it( 'normalizes every item in an array response', () => {
			const records = [
				{ id: 1, title: null },
				{ id: 2, title: { raw: 'My Page', rendered: 'My Page' } },
				{ id: 3, title: null },
			];
			expect( normalizeRestResponse( records ) ).toEqual( [
				{ id: 1, title: { raw: '', rendered: '' } },
				{ id: 2, title: { raw: 'My Page', rendered: 'My Page' } },
				{ id: 3, title: { raw: '', rendered: '' } },
			] );
		} );

		it( 'passes through responses without a title field unchanged', () => {
			const record = { id: 1, type: 'nav_menu_item', url: 'https://example.com' };
			expect( normalizeRestResponse( record ) ).toEqual( record );
		} );

		it( 'passes through non-object responses unchanged', () => {
			expect( normalizeRestResponse( null ) ).toBeNull();
		} );
	} );

	describe( 'apiFetch middleware registration', () => {
		it( 'registers an apiFetch middleware on module load', () => {
			const apiFetch = require( '@wordpress/api-fetch' );
			expect( apiFetch.use ).toHaveBeenCalledWith( expect.any( Function ) );
		} );
	} );
} );

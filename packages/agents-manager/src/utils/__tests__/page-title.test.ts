jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( { dispatch: jest.fn(), resolveSelect: jest.fn() } ) );

import { dispatch, resolveSelect } from '@wordpress/data';
import { getPageTitle, setPageTitle } from '../page-title';

const editEntityRecord = jest.fn();

const withPage = ( page: unknown ) => {
	( resolveSelect as jest.Mock ).mockReturnValue( {
		getEditedEntityRecord: jest.fn().mockResolvedValue( page ),
	} );
	( dispatch as jest.Mock ).mockReturnValue( { editEntityRecord } );
};

beforeEach( () => jest.clearAllMocks() );

describe( 'getPageTitle', () => {
	// Titles arrive flat, raw or rendered depending on how the record was read.
	it.each( [
		{ case: 'a flat string', title: 'About', expected: 'About' },
		{
			case: 'a raw value',
			title: { raw: 'About', rendered: 'About &amp; more' },
			expected: 'About',
		},
		{ case: 'only a rendered value', title: { rendered: 'About' }, expected: 'About' },
		{ case: 'no title', title: undefined, expected: '' },
	] )( 'reads $case', async ( { title, expected } ) => {
		withPage( { title } );

		await expect( getPageTitle( 7 ) ).resolves.toBe( expected );
	} );

	// An untitled page also reads as `''`, and that one is still editable.
	it( 'refuses a page that cannot be read', async () => {
		withPage( null );

		await expect( getPageTitle( 7 ) ).rejects.toThrow( 'Page 7 could not be read' );
	} );
} );

describe( 'setPageTitle', () => {
	it( 'renames the page outside the undo stack', async () => {
		withPage( { title: 'About' } );

		await setPageTitle( 7, 'About us' );

		expect( editEntityRecord ).toHaveBeenCalledWith(
			'postType',
			'page',
			7,
			{ title: 'About us' },
			{ undoIgnore: true }
		);
	} );

	it( 'refuses a page that cannot be read', async () => {
		withPage( null );

		await expect( setPageTitle( 7, 'About us' ) ).rejects.toThrow( 'Page 7 could not be read' );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );

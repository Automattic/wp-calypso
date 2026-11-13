/* eslint-disable import/order */
import { type Mock, vi } from 'vitest';
vi.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
vi.mock( '@wordpress/data', () => ( { dispatch: vi.fn(), resolveSelect: vi.fn() } ) );

import { dispatch, resolveSelect } from '@wordpress/data';
import { getPageTitle, setPageTitle } from '../page-title';

const editEntityRecord = vi.fn();

const withPage = ( page: unknown ) => {
	( resolveSelect as Mock ).mockReturnValue( {
		getEditedEntityRecord: vi.fn().mockResolvedValue( page ),
	} );
	( dispatch as Mock ).mockReturnValue( { editEntityRecord } );
};

beforeEach( () => vi.clearAllMocks() );

describe( 'getPageTitle', () => {
	// `flattenTitle()` owns the title shapes; here, only that it is applied.
	it.each( [
		{
			case: 'a raw value',
			title: { raw: 'About', rendered: 'About &amp; more' },
			expected: 'About',
		},
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

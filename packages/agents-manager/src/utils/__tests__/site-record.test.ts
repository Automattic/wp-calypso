vi.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
vi.mock( '@wordpress/data', () => ( { select: vi.fn(), dispatch: vi.fn() } ) );

import { dispatch, select } from '@wordpress/data';
import { type Mock, vi } from 'vitest';
import { editSiteFields } from '../site-record';

const editEntityRecord = vi.fn();

beforeEach( () => {
	vi.clearAllMocks();
	( select as Mock ).mockReturnValue( {
		getEditedEntityRecord: () => ( { title: 'Old', description: 'Kept' } ),
	} );
	( dispatch as Mock ).mockReturnValue( { editEntityRecord } );
} );

it( 'writes the field as a pending edit, out of the undo stack', () => {
	editSiteFields( { title: 'New' } );

	expect( editEntityRecord ).toHaveBeenCalledWith(
		'root',
		'site',
		undefined,
		{ title: 'New' },
		{
			undoIgnore: true,
		}
	);
} );

it( 'refuses to write before the site record has loaded', () => {
	( select as Mock ).mockReturnValue( { getEditedEntityRecord: () => false } );

	expect( () => editSiteFields( { title: 'New' } ) ).toThrow( 'unavailable' );
	expect( editEntityRecord ).not.toHaveBeenCalled();
} );

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( { select: jest.fn(), dispatch: jest.fn() } ) );

import { dispatch, select } from '@wordpress/data';
import { saveSiteFields } from '../site-record';

const editEntityRecord = jest.fn();
const saveSpecifiedEntityEdits = jest.fn();

beforeEach( () => {
	jest.clearAllMocks();
	( select as jest.Mock ).mockReturnValue( {
		getEditedEntityRecord: () => ( { title: 'Old', description: 'Kept' } ),
	} );
	( dispatch as jest.Mock ).mockReturnValue( {
		editEntityRecord,
		__experimentalSaveSpecifiedEntityEdits: saveSpecifiedEntityEdits,
	} );
} );

// Scoped to the field written: a blanket save would publish whatever else
// the user had left pending on the record.
it( 'writes the field out of the undo stack and saves only that field', async () => {
	await saveSiteFields( { title: 'New' } );

	expect( editEntityRecord ).toHaveBeenCalledWith(
		'root',
		'site',
		undefined,
		{ title: 'New' },
		{
			undoIgnore: true,
		}
	);
	expect( saveSpecifiedEntityEdits ).toHaveBeenCalledWith( 'root', 'site', undefined, [ 'title' ], {
		throwOnError: true,
	} );
} );

// A failed save would otherwise strand a value with no undo of any kind.
it( 'puts the previous value back when the save fails', async () => {
	saveSpecifiedEntityEdits.mockRejectedValueOnce( new Error( 'offline' ) );

	await expect( saveSiteFields( { title: 'New' } ) ).rejects.toThrow( 'offline' );
	expect( editEntityRecord ).toHaveBeenLastCalledWith(
		'root',
		'site',
		undefined,
		{ title: 'Old' },
		{
			undoIgnore: true,
		}
	);
} );

it( 'refuses to write before the site record has loaded', async () => {
	( select as jest.Mock ).mockReturnValue( { getEditedEntityRecord: () => false } );

	await expect( saveSiteFields( { title: 'New' } ) ).rejects.toThrow( 'unavailable' );
	expect( editEntityRecord ).not.toHaveBeenCalled();
} );

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( { select: jest.fn(), dispatch: jest.fn() } ) );

import { dispatch, select } from '@wordpress/data';
import { editSiteFields } from '../site-record';

const editEntityRecord = jest.fn();

beforeEach( () => {
	jest.clearAllMocks();
	( select as jest.Mock ).mockReturnValue( {
		getEditedEntityRecord: () => ( { title: 'Old', description: 'Kept' } ),
	} );
	( dispatch as jest.Mock ).mockReturnValue( { editEntityRecord } );
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
	( select as jest.Mock ).mockReturnValue( { getEditedEntityRecord: () => false } );

	expect( () => editSiteFields( { title: 'New' } ) ).toThrow( 'unavailable' );
	expect( editEntityRecord ).not.toHaveBeenCalled();
} );

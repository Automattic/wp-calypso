jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn(),
	select: jest.fn(),
	subscribe: jest.fn( () => () => {} ),
} ) );

import { dispatch, select } from '@wordpress/data';
import {
	editGlobalStyles,
	getEditedGlobalStyles,
	waitForEditedGlobalStyles,
} from '../global-styles';

const RECORD = { settings: { color: {} }, styles: {} };

function mockCore( {
	globalStylesId = 'global-styles-1',
	record = RECORD as unknown,
	store = true,
}: { globalStylesId?: string | null; record?: unknown; store?: boolean } = {} ) {
	( select as jest.Mock ).mockReturnValue(
		store
			? {
					__experimentalGetCurrentGlobalStylesId: () => globalStylesId,
					getEditedEntityRecord: () => record,
			  }
			: undefined
	);
}

beforeEach( () => jest.clearAllMocks() );

describe( 'getEditedGlobalStyles', () => {
	it( 'reads the edited record under its id', () => {
		mockCore();

		expect( getEditedGlobalStyles() ).toEqual( { id: 'global-styles-1', record: RECORD } );
	} );

	it.each( [
		[ 'no core-data store', { store: false } ],
		[ 'no global styles id', { globalStylesId: null } ],
		[ 'an unresolved record', { record: false } ],
	] )( 'reads %s as unavailable', ( _case, options ) => {
		mockCore( options );

		expect( getEditedGlobalStyles() ).toBeUndefined();
	} );
} );

describe( 'editGlobalStyles', () => {
	it( 'edits outside the undo stack', () => {
		const editEntityRecord = jest.fn();
		( dispatch as jest.Mock ).mockReturnValue( { editEntityRecord } );

		editGlobalStyles( 'global-styles-1', RECORD );

		expect( editEntityRecord ).toHaveBeenCalledWith(
			'root',
			'globalStyles',
			'global-styles-1',
			RECORD,
			{ undoIgnore: true }
		);
	} );

	it( 'throws without a store', () => {
		( dispatch as jest.Mock ).mockReturnValue( undefined );

		expect( () => editGlobalStyles( 'global-styles-1', RECORD ) ).toThrow(
			'Global styles are unavailable to edit.'
		);
	} );
} );

describe( 'waitForEditedGlobalStyles', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => jest.useRealTimers() );

	it( 'resolves with the record at once when it is loaded', async () => {
		mockCore();

		await expect( waitForEditedGlobalStyles() ).resolves.toEqual( {
			id: 'global-styles-1',
			record: RECORD,
		} );
	} );

	it( 'gives up after the timeout', async () => {
		mockCore( { record: false } );

		const waiting = waitForEditedGlobalStyles();
		jest.advanceTimersByTime( 10000 );

		await expect( waiting ).resolves.toBeUndefined();
	} );
} );

/* eslint-disable import/order */
import { type Mock, vi } from 'vitest';
vi.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
vi.mock( '@wordpress/data', () => ( {
	dispatch: vi.fn(),
	select: vi.fn(),
	subscribe: vi.fn( () => () => {} ),
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
	( select as Mock ).mockReturnValue(
		store
			? {
					__experimentalGetCurrentGlobalStylesId: () => globalStylesId,
					getEditedEntityRecord: () => record,
				}
			: undefined
	);
}

beforeEach( () => vi.clearAllMocks() );

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
		const editEntityRecord = vi.fn();
		( dispatch as Mock ).mockReturnValue( { editEntityRecord } );

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
		( dispatch as Mock ).mockReturnValue( undefined );

		expect( () => editGlobalStyles( 'global-styles-1', RECORD ) ).toThrow(
			'Global styles are unavailable to edit.'
		);
	} );
} );

describe( 'waitForEditedGlobalStyles', () => {
	beforeEach( () => vi.useFakeTimers() );
	afterEach( () => vi.useRealTimers() );

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
		vi.advanceTimersByTime( 10000 );

		await expect( waiting ).resolves.toBeUndefined();
	} );
} );

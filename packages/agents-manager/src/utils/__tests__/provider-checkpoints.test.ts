import { select } from '@wordpress/data';
import {
	getProviderCheckpoint,
	getProviderCheckpointObservedAt,
	getProviderCheckpointRecords,
	getProviderCheckpoints,
	setProviderCheckpoints,
	stampProviderCheckpointObservations,
} from '../provider-checkpoints';
import type { UseCheckpointReturn } from '../load-external-providers';

jest.mock( '@wordpress/data', () => ( { select: jest.fn() } ) );

const mockSelect = select as jest.Mock;

beforeEach( () => {
	jest.clearAllMocks();
	setProviderCheckpoints( undefined );
} );

describe( 'setProviderCheckpoints / getProviderCheckpoints', () => {
	it( 'holds the registered provider checkpoint API', () => {
		const api = { hasCheckpoint: jest.fn() } as unknown as UseCheckpointReturn;

		setProviderCheckpoints( api );
		expect( getProviderCheckpoints() ).toBe( api );

		setProviderCheckpoints( undefined );
		expect( getProviderCheckpoints() ).toBeUndefined();
	} );
} );

describe( 'getProviderCheckpoint', () => {
	it( 'reads the restore-relevant fields of a provider-held checkpoint', () => {
		mockSelect.mockReturnValue( {
			getCheckpoints: () => [
				{
					id: 'toolu_1',
					checkpointKeys: [ 'page', 'navigation' ],
					pageRename: { pageId: 12, oldTitle: 'About', newTitle: 'Our Story' },
					navigationRecords: { 'nav-1': {} },
				},
				{ id: 'toolu_2', checkpointKeys: [ 'blocks' ] },
			],
		} );

		expect( getProviderCheckpoint( 'toolu_1' ) ).toEqual( {
			checkpointKeys: [ 'page', 'navigation' ],
			pageRename: { pageId: 12, oldTitle: 'About', newTitle: 'Our Story' },
			navigationRecords: { 'nav-1': {} },
		} );
		expect( mockSelect ).toHaveBeenCalledWith( 'ai-assembler' );
	} );

	it( 'omits the optional fields the record does not carry', () => {
		mockSelect.mockReturnValue( {
			getCheckpoints: () => [ { id: 'toolu_1', checkpointKeys: [ 'site_title' ] } ],
		} );

		expect( getProviderCheckpoint( 'toolu_1' ) ).toEqual( { checkpointKeys: [ 'site_title' ] } );
	} );

	it.each( [
		[ 'the store is not registered', undefined ],
		[ 'the selector is missing', {} ],
		[ 'the checkpoint is unknown', { getCheckpoints: () => [ { id: 'toolu_other' } ] } ],
		[
			'the keys are not an array',
			{ getCheckpoints: () => [ { id: 'toolu_1', checkpointKeys: 'color' } ] },
		],
		[
			'the checkpoint is keyless',
			{ getCheckpoints: () => [ { id: 'toolu_1', checkpointKeys: [] } ] },
		],
	] )( 'returns null when %s', ( _case, storeSelect ) => {
		mockSelect.mockReturnValue( storeSelect );

		expect( getProviderCheckpoint( 'toolu_1' ) ).toBeNull();
	} );
} );

describe( 'getProviderCheckpointRecords', () => {
	it( 'lists every provider-held checkpoint that carries an id', () => {
		mockSelect.mockReturnValue( {
			getCheckpoints: () => [
				{ id: 'toolu_1', toolId: 'big_sky__restore_checkpoint', requestIntentType: 'redo' },
				{ id: 'toolu_2', checkpointKeys: [ 'blocks' ] },
				{ checkpointKeys: [ 'color' ] },
			],
		} );

		expect( getProviderCheckpointRecords() ).toEqual( [
			{ id: 'toolu_1', toolId: 'big_sky__restore_checkpoint', requestIntentType: 'redo' },
			{ id: 'toolu_2', checkpointKeys: [ 'blocks' ] },
		] );
	} );

	it.each( [
		[ 'the store is not registered', undefined ],
		[ 'the selector is missing', {} ],
	] )( 'returns an empty list when %s', ( _case, storeSelect ) => {
		mockSelect.mockReturnValue( storeSelect );

		expect( getProviderCheckpointRecords() ).toEqual( [] );
	} );
} );

describe( 'stampProviderCheckpointObservations / getProviderCheckpointObservedAt', () => {
	it( 'keeps the first-seen time across repeated sightings', () => {
		const now = jest.spyOn( Date, 'now' );
		now.mockReturnValue( 1000 );
		stampProviderCheckpointObservations( [ 'toolu_seen' ] );
		now.mockReturnValue( 2000 );
		stampProviderCheckpointObservations( [ 'toolu_seen', 'toolu_new' ] );

		expect( getProviderCheckpointObservedAt( 'toolu_seen' ) ).toBe( 1000 );
		expect( getProviderCheckpointObservedAt( 'toolu_new' ) ).toBe( 2000 );
		expect( getProviderCheckpointObservedAt( 'toolu_unseen' ) ).toBe( 0 );

		now.mockRestore();
	} );
} );

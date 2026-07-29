import { select } from '@wordpress/data';
import {
	getProviderCheckpointKeys,
	getProviderCheckpoints,
	setProviderCheckpoints,
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

describe( 'getProviderCheckpointKeys', () => {
	it( 'reads the scoped keys of a provider-held checkpoint', () => {
		mockSelect.mockReturnValue( {
			getCheckpoints: () => [
				{ id: 'toolu_1', checkpointKeys: [ 'site_title', 'site_metadata' ] },
				{ id: 'toolu_2', checkpointKeys: [ 'blocks' ] },
			],
		} );

		expect( getProviderCheckpointKeys( 'toolu_1' ) ).toEqual( [ 'site_title', 'site_metadata' ] );
		expect( mockSelect ).toHaveBeenCalledWith( 'ai-assembler' );
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

		expect( getProviderCheckpointKeys( 'toolu_1' ) ).toBeNull();
	} );
} );

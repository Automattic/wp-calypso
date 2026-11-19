import apiFetch from '@wordpress/api-fetch';
import { type Mock, vi } from 'vitest';
import wpcomRequest, { canAccessWpcomApis } from '../../wpcom-request';
import { persistAgentsManagerState, setShouldPersistState } from '../persist-state';

vi.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: vi.fn(),
} ) );

vi.mock( '../../wpcom-request', () => ( {
	__esModule: true,
	default: vi.fn(),
	canAccessWpcomApis: vi.fn(),
} ) );

const mockRequest = wpcomRequest as unknown as Mock;
const mockApiFetch = apiFetch as unknown as Mock;
const mockCanAccess = canAccessWpcomApis as unknown as Mock;

// Let the queued flush chain (microtasks) run to completion.
const tick = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'persistAgentsManagerState', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		setShouldPersistState( () => true );
		mockCanAccess.mockReturnValue( true );
		mockRequest.mockResolvedValue( undefined );
		mockApiFetch.mockResolvedValue( undefined );
	} );

	it( 'skips save requests when the host opts out of persisted state', () => {
		setShouldPersistState( () => false );

		persistAgentsManagerState( { agents_manager_docked: true } );

		expect( mockCanAccess ).not.toHaveBeenCalled();
		expect( mockRequest ).not.toHaveBeenCalled();
		expect( mockApiFetch ).not.toHaveBeenCalled();
	} );

	it( 'sends a single save as one wpcom request', async () => {
		persistAgentsManagerState( { agents_manager_minimized: false } );

		expect( mockRequest ).toHaveBeenCalledTimes( 1 );
		expect( mockRequest ).toHaveBeenCalledWith(
			expect.objectContaining( { body: { state: { agents_manager_minimized: false } } } )
		);
		await tick();
	} );

	it( 'coalesces saves that arrive mid-flight into one merged follow-up request', async () => {
		let finishFirst: () => void = () => {};
		mockRequest.mockReturnValueOnce(
			new Promise< void >( ( resolve ) => ( finishFirst = resolve ) )
		);

		// First save goes out immediately and stays in flight.
		persistAgentsManagerState( { agents_manager_docked: true } );
		// These arrive while it's in flight — they must not race; they merge.
		persistAgentsManagerState( { agents_manager_minimized: false } );
		persistAgentsManagerState( { agents_manager_docked: false } );

		expect( mockRequest ).toHaveBeenCalledTimes( 1 );

		finishFirst();
		await tick();

		// One follow-up carrying the merged state (last value wins per key).
		expect( mockRequest ).toHaveBeenCalledTimes( 2 );
		expect( mockRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				body: { state: { agents_manager_minimized: false, agents_manager_docked: false } },
			} )
		);
	} );

	it( 'falls back to apiFetch when wpcom APIs are unavailable', async () => {
		mockCanAccess.mockReturnValue( false );

		persistAgentsManagerState( { agents_manager_open: true } );

		expect( mockRequest ).not.toHaveBeenCalled();
		expect( mockApiFetch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/agents-manager/open-state',
				data: { agents_manager_open: true },
			} )
		);
		await tick();
	} );
} );

import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from '../../wpcom-request';
import { persistAgentsManagerState } from '../persist-state';

jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( '../../wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn(),
} ) );

const mockRequest = wpcomRequest as unknown as jest.Mock;
const mockApiFetch = apiFetch as unknown as jest.Mock;
const mockCanAccess = canAccessWpcomApis as unknown as jest.Mock;

// Let the queued flush chain (microtasks) run to completion.
const tick = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'persistAgentsManagerState', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockCanAccess.mockReturnValue( true );
		mockRequest.mockResolvedValue( undefined );
		mockApiFetch.mockResolvedValue( undefined );
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
		persistAgentsManagerState( { agents_manager_router_history: 'a' } );
		// These arrive while it's in flight — they must not race; they merge.
		persistAgentsManagerState( { agents_manager_minimized: false } );
		persistAgentsManagerState( { agents_manager_router_history: 'b' } );

		expect( mockRequest ).toHaveBeenCalledTimes( 1 );

		finishFirst();
		await tick();

		// One follow-up carrying the merged state (last value wins per key).
		expect( mockRequest ).toHaveBeenCalledTimes( 2 );
		expect( mockRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				body: { state: { agents_manager_minimized: false, agents_manager_router_history: 'b' } },
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

import { apiFetch } from '@wordpress/data-controls';
import { type MockedFunction, vi } from 'vitest';
import { canAccessWpcomApis } from '../../wpcom-request';
import { setHasLoaded, setIsLoading } from '../actions';
import { getAgentsManagerState } from '../resolvers';

vi.mock( '../../wpcom-request', () => ( {
	__esModule: true,
	default: vi.fn(),
	canAccessWpcomApis: vi.fn(),
} ) );

const mockCanAccessWpcomApis = canAccessWpcomApis as MockedFunction< typeof canAccessWpcomApis >;

describe( 'Agents Manager resolvers', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'skips persisted state requests when the host opts out', () => {
		const shouldUsePersistedState = vi.fn( () => false );
		const resolver = getAgentsManagerState( shouldUsePersistedState );

		expect( resolver.next().value ).toEqual( setHasLoaded( true ) );
		expect( resolver.next().done ).toBe( true );
		expect( shouldUsePersistedState ).toHaveBeenCalledTimes( 1 );
		expect( mockCanAccessWpcomApis ).not.toHaveBeenCalled();
	} );

	it( 'loads persisted state when the host opts in', () => {
		mockCanAccessWpcomApis.mockReturnValue( false );
		const resolver = getAgentsManagerState( () => true );

		expect( resolver.next().value ).toEqual( setIsLoading( true ) );
		expect( resolver.next().value ).toEqual(
			apiFetch( {
				global: true,
				path: '/agents-manager/open-state',
			} )
		);
	} );
} );

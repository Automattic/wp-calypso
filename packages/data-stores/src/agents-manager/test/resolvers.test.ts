import { apiFetch } from '@wordpress/data-controls';
import { canAccessWpcomApis } from '../../wpcom-request';
import { setHasLoaded, setIsLoading } from '../actions';
import { getAgentsManagerState } from '../resolvers';

jest.mock( '../../wpcom-request', () => ( {
	canAccessWpcomApis: jest.fn(),
} ) );

const mockCanAccessWpcomApis = canAccessWpcomApis as jest.MockedFunction<
	typeof canAccessWpcomApis
>;

describe( 'Agents Manager resolvers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'skips persisted state requests when the host opts out', () => {
		const shouldLoadPersistedState = jest.fn( () => false );
		const resolver = getAgentsManagerState( shouldLoadPersistedState );

		expect( resolver.next().value ).toEqual( setHasLoaded( true ) );
		expect( resolver.next().done ).toBe( true );
		expect( shouldLoadPersistedState ).toHaveBeenCalledTimes( 1 );
		expect( mockCanAccessWpcomApis ).not.toHaveBeenCalled();
	} );

	it( 'keeps loading persisted state by default', () => {
		mockCanAccessWpcomApis.mockReturnValue( false );
		const resolver = getAgentsManagerState();

		expect( resolver.next().value ).toEqual( setIsLoading( true ) );
		expect( resolver.next().value ).toEqual(
			apiFetch( {
				global: true,
				path: '/agents-manager/open-state',
			} )
		);
	} );
} );

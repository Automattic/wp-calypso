/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useCurrentSupportInteraction } from '../use-current-support-interaction';

const mockNavigate = jest.fn();
let mockSearch = '';
let mockQueryStatus: 'pending' | 'success' | 'error' = 'pending';

jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: mockSearch } ),
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '../use-get-support-interaction-by-id', () => ( {
	useGetSupportInteractionById: () => ( { status: mockQueryStatus } ),
} ) );

describe( 'useCurrentSupportInteraction', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSearch = '';
		mockQueryStatus = 'pending';
	} );

	it( 'navigates to /odie once when the interaction errors, even across re-renders', () => {
		mockSearch = '?id=int-1';
		mockQueryStatus = 'error';

		const { rerender } = renderHook( () => useCurrentSupportInteraction() );
		// Re-render repeatedly while the query stays in the error state.
		rerender();
		rerender();
		rerender();

		expect( mockNavigate ).toHaveBeenCalledTimes( 1 );
		expect( mockNavigate ).toHaveBeenCalledWith( '/odie' );
	} );

	it( 'does not navigate when the interaction loads successfully', () => {
		mockSearch = '?id=int-1';
		mockQueryStatus = 'success';

		renderHook( () => useCurrentSupportInteraction() );

		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	it( 'does not navigate when there is no id', () => {
		mockSearch = '';
		mockQueryStatus = 'error';

		renderHook( () => useCurrentSupportInteraction() );

		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	it( 'supports the legacy odieInteractionId param', () => {
		mockSearch = '?odieInteractionId=int-2';
		mockQueryStatus = 'error';

		renderHook( () => useCurrentSupportInteraction() );

		expect( mockNavigate ).toHaveBeenCalledTimes( 1 );
		expect( mockNavigate ).toHaveBeenCalledWith( '/odie' );
	} );
} );

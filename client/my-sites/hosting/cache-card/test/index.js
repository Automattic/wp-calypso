/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	useEdgeCacheQuery,
	useSetEdgeCacheMutation,
	useIsSetEdgeCacheMutating,
	useClearEdgeCacheMutation,
} from 'calypso/data/hosting/use-cache';
import { CacheCard } from '..';

const INITIAL_STATE = {
	sites: {
		items: {},
	},
	options: {
		onError: () => {},
	},
};
const mockStore = configureStore();
const store = mockStore( INITIAL_STATE );

const mockUseDispatch = jest.fn();
jest.mock( 'react-redux', () => ( {
	__esModule: true,
	...jest.requireActual( 'react-redux' ),
	useDispatch: () => mockUseDispatch,
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	__esModule: true,
	...jest.requireActual( '@tanstack/react-query' ),
	useQueryClient: () => ( {
		invalidateQueries: jest.fn(),
	} ),
} ) );

jest.mock( 'calypso/data/hosting/use-cache', () => ( {
	__esModule: true,
	useEdgeCacheQuery: jest.fn( () => {
		return {
			data: true,
		};
	} ),
	useSetEdgeCacheMutation: jest.fn( () => {
		return {
			toggleEdgeCache: jest.fn(),
		};
	} ),
	useIsSetEdgeCacheMutating: jest.fn( () => false ),
	useClearEdgeCacheMutation: jest.fn( () => {
		return {
			clearEdgeCache: jest.fn(),
			isLoading: false,
		};
	} ),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	__esModule: true,
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/hosting/actions', () => ( {
	__esModule: true,
	clearWordPressCache: jest.fn(),
} ) );

const defaultProps = {
	translate: ( text ) => text,
	disabled: false,
	shouldRateLimitCacheClear: false,
	clearAtomicWordPressCache: jest.fn(),
	isClearingWordpressCache: false,
	siteId: 1,
};

describe( 'CacheCard component', () => {
	beforeAll( () => {
		// Mock the missing `window.matchMedia` function that's not even in JSDOM
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation( ( query ) => ( {
				matches: false,
				media: query,
				onchange: null,
				addListener: jest.fn(), // deprecated
				removeListener: jest.fn(), // deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			} ) ),
		} );
		jest.clearAllMocks();
	} );

	it( 'toggles edge cache state when edge cache checkbox is clicked', async () => {
		useEdgeCacheQuery.mockReturnValue( { data: false, isLoading: false } );
		useSetEdgeCacheMutation.mockReturnValue( { setEdgeCache: jest.fn(), isLoading: false } );
		useIsSetEdgeCacheMutating.mockReturnValue( false );

		render(
			<Provider store={ store }>
				<CacheCard { ...defaultProps } />
			</Provider>
		);
		expect( useSetEdgeCacheMutation().setEdgeCache ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'checkbox' ) ).toBeVisible();
		screen.getByRole( 'checkbox' ).click();
		expect( useSetEdgeCacheMutation().setEdgeCache ).toHaveBeenCalledWith( 1, true );
	} );
	it( 'displays rate limit message when shouldRateLimitCacheClear prop is true', () => {
		useEdgeCacheQuery.mockReturnValue( { data: false, isLoading: false } );

		render(
			<Provider store={ store }>
				<CacheCard { ...{ ...defaultProps, shouldRateLimitCacheClear: true } } />
			</Provider>
		);
		expect( screen.getByText( /you cleared the cache recently/i ) ).toBeInTheDocument();
	} );
	it( 'disables "Clear cache" button when isClearingCache prop is true', () => {
		useEdgeCacheQuery.mockReturnValue( { data: false, isLoading: false } );

		render(
			<Provider store={ store }>
				<CacheCard { ...{ ...defaultProps, isClearingWordpressCache: true } } />
			</Provider>
		);
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
	} );
	it( 'clears cache', () => {
		useEdgeCacheQuery.mockReturnValue( { data: true, isLoading: false } );
		useClearEdgeCacheMutation.mockReturnValue( {
			clearEdgeCache: jest.fn(),
			isLoading: false,
		} );

		render(
			<Provider store={ store }>
				<CacheCard { ...{ ...defaultProps } } />
			</Provider>
		);
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( useClearEdgeCacheMutation().clearEdgeCache ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.clearAtomicWordPressCache ).toHaveBeenCalledTimes( 1 );
	} );
	it( 'shows the Clear Cache button', () => {
		useEdgeCacheQuery.mockReturnValue( { data: true, isLoading: true } );
		useClearEdgeCacheMutation.mockReturnValue( {
			clearEdgeCache: jest.fn(),
			isLoading: false,
		} );
		render(
			<Provider store={ store }>
				<CacheCard { ...{ ...defaultProps } } />
			</Provider>
		);
		expect( screen.queryByRole( 'button' ) ).toBeTruthy();
		expect( screen.queryByRole( 'button' ) ).toBeDisabled();
		fireEvent.click( screen.getByRole( 'button' ) );
	} );
} );

/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import { vi } from 'vitest';
import {
	useEdgeCacheQuery,
	useSetEdgeCacheMutation,
	useClearEdgeCacheMutation,
} from 'calypso/data/hosting/use-cache';
import CacheCard from 'calypso/sites/settings/performance/form';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import getRequest from 'calypso/state/selectors/get-request';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';

const INITIAL_STATE = {
	sites: {
		items: {},
	},
	siteSettings: { items: {} },
	ui: {
		selectedSiteId: 1,
	},
	options: {
		onError: () => {},
	},
};
const mockStore = configureStore();
const store = mockStore( INITIAL_STATE );

vi.mock( 'calypso/components/inline-support-link', () => {
	return {
		default: () => {
			<>InlineSupportLink</>;
		},
	};
} );

vi.mock( 'react-redux', async () => ( {
	__esModule: true,
	...( await vi.importActual< typeof import( 'react-redux' ) >( 'react-redux' ) ),
	useDispatch: vi.fn(),
} ) );

vi.mock( 'calypso/data/hosting/use-cache' );
vi.mock( 'calypso/state/selectors/get-request' );
vi.mock( 'calypso/state/selectors/should-rate-limit-atomic-cache-clear' );
vi.mock( 'calypso/state/hosting/actions' );

describe( 'CacheCard component', () => {
	beforeEach( () => {
		vi.clearAllMocks();

		vi.mocked( useDispatch ).mockReturnValue( vi.fn() );
		vi.mocked( useEdgeCacheQuery ).mockReturnValue( { data: false, isLoading: false } );
		vi.mocked( useSetEdgeCacheMutation ).mockReturnValue( {
			toggleEdgeCache: vi.fn(),
		} );
		vi.mocked( useClearEdgeCacheMutation ).mockReturnValue( {
			mutate: vi.fn(),
			isPending: false,
		} );
		vi.mocked( getRequest ).mockReturnValue( { isLoading: false } );
		vi.mocked( shouldRateLimitAtomicCacheClear ).mockReturnValue( false );
	} );

	function renderWithProvider() {
		render(
			<Provider store={ store }>
				<CacheCard disabled={ false } />
			</Provider>
		);
	}

	it( 'toggles edge cache state when edge cache checkbox is clicked', async () => {
		const setEdgeCacheMock = vi.fn();
		vi.mocked( useSetEdgeCacheMutation ).mockReturnValue( {
			setEdgeCache: setEdgeCacheMock,
			isLoading: false,
		} );

		renderWithProvider();
		expect( setEdgeCacheMock ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'checkbox' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'checkbox' ) );
		expect( setEdgeCacheMock ).toHaveBeenCalledWith( 1, true );
	} );

	it( 'disables "Clear cache" button when isClearingCache prop is true', () => {
		vi.mocked( getRequest ).mockReturnValue( { isLoading: true } );

		renderWithProvider();
		expect( screen.queryByText( 'Clear all caches' ) ).toBeDisabled();
	} );

	it( 'clears all caches', async () => {
		vi.mocked( useEdgeCacheQuery ).mockReturnValue( { data: true, isLoading: false } );

		const mutationMock = { mutate: vi.fn(), isPending: false };
		vi.mocked( useClearEdgeCacheMutation ).mockReturnValue( mutationMock );

		const mockedDispatch = vi.fn();
		vi.mocked( useDispatch ).mockReturnValue( mockedDispatch );

		renderWithProvider();

		await userEvent.click( screen.getByText( 'Clear all caches' ) );

		expect( mutationMock.mutate ).toHaveBeenCalledTimes( 1 );
		expect( mockedDispatch ).toHaveBeenCalledWith(
			clearWordPressCache( 1, 'Manually clearing again.' )
		);
	} );

	it( 'shows the Clear Cache button', () => {
		vi.mocked( useEdgeCacheQuery ).mockReturnValue( { data: true, isLoading: true } );
		vi.mocked( useClearEdgeCacheMutation ).mockReturnValue( { mutate: vi.fn(), isPending: false } );

		renderWithProvider();

		expect( screen.queryByText( 'Clear all caches' ) ).toBeTruthy();
	} );

	it( 'clears object cache', async () => {
		vi.mocked( useEdgeCacheQuery ).mockReturnValue( { data: true, isLoading: false } );

		const mutationMock = { mutate: vi.fn(), isPending: false };
		vi.mocked( useClearEdgeCacheMutation ).mockReturnValue( mutationMock );

		const mockedDispatch = vi.fn();
		vi.mocked( useDispatch ).mockReturnValue( mockedDispatch );

		renderWithProvider();

		await userEvent.click( screen.getByText( 'Clear object cache' ) );

		expect( mutationMock.mutate ).not.toHaveBeenCalled();
		expect( mockedDispatch ).toHaveBeenCalledWith(
			clearWordPressCache( 1, 'Manually clearing again.' )
		);
	} );

	it( 'clears edge cache', async () => {
		vi.mocked( useEdgeCacheQuery ).mockReturnValue( { data: true, isLoading: false } );

		const mutationMock = { mutate: vi.fn(), isPending: false };
		vi.mocked( useClearEdgeCacheMutation ).mockReturnValue( mutationMock );

		const mockedDispatch = vi.fn();
		vi.mocked( useDispatch ).mockReturnValue( mockedDispatch );

		renderWithProvider();

		await userEvent.click( screen.getByText( 'Clear edge cache' ) );

		expect( mutationMock.mutate ).toHaveBeenCalledTimes( 1 );
		expect( mockedDispatch ).not.toHaveBeenCalledWith(
			clearWordPressCache( 1, 'Manually clearing again.' )
		);
	} );
} );

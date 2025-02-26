/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	useEdgeCacheQuery,
	useSetEdgeCacheMutation,
	useClearEdgeCacheMutation,
} from 'calypso/data/hosting/use-cache';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
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

jest.mock( 'calypso/components/inline-support-link', () => {
	return () => {
		<>InlineSupportLink</>;
	};
} );

jest.mock( 'react-redux', () => ( {
	__esModule: true,
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/data/hosting/use-cache' );
jest.mock( 'calypso/state/selectors/get-request' );
jest.mock( 'calypso/state/selectors/should-rate-limit-atomic-cache-clear' );
jest.mock( 'calypso/state/hosting/actions' );
jest.mock( 'calypso/lib/remove-duplicate-views-experiment' );

describe( 'CacheCard component', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( useDispatch ).mockReturnValue( jest.fn() );
		jest.mocked( useEdgeCacheQuery ).mockReturnValue( { data: false, isLoading: false } );
		jest.mocked( useSetEdgeCacheMutation ).mockReturnValue( {
			toggleEdgeCache: jest.fn(),
		} );
		jest.mocked( useClearEdgeCacheMutation ).mockReturnValue( {
			mutate: jest.fn(),
			isPending: false,
		} );
		jest.mocked( getRequest ).mockReturnValue( { isLoading: false } );
		jest.mocked( shouldRateLimitAtomicCacheClear ).mockReturnValue( false );
		jest.mocked( useRemoveDuplicateViewsExperimentEnabled ).mockReturnValue( false );
	} );

	function renderWithProvider() {
		render(
			<Provider store={ store }>
				<CacheCard disabled={ false } />
			</Provider>
		);
	}

	it( 'toggles edge cache state when edge cache checkbox is clicked', async () => {
		const setEdgeCacheMock = jest.fn();
		jest
			.mocked( useSetEdgeCacheMutation )
			.mockReturnValue( { setEdgeCache: setEdgeCacheMock, isLoading: false } );

		renderWithProvider();
		expect( setEdgeCacheMock ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'checkbox' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'checkbox' ) );
		expect( setEdgeCacheMock ).toHaveBeenCalledWith( 1, true );
	} );

	it( 'disables "Clear cache" button when isClearingCache prop is true', () => {
		jest.mocked( getRequest ).mockReturnValue( { isLoading: true } );

		renderWithProvider();
		expect( screen.queryByText( 'Clear all caches' ) ).toBeDisabled();
	} );

	it( 'clears all caches', async () => {
		jest.mocked( useEdgeCacheQuery ).mockReturnValue( { data: true, isLoading: false } );

		const mutationMock = { mutate: jest.fn(), isPending: false };
		jest.mocked( useClearEdgeCacheMutation ).mockReturnValue( mutationMock );

		const mockedDispatch = jest.fn();
		jest.mocked( useDispatch ).mockReturnValue( mockedDispatch );

		renderWithProvider();

		await userEvent.click( screen.getByText( 'Clear all caches' ) );

		expect( mutationMock.mutate ).toHaveBeenCalledTimes( 1 );
		expect( mockedDispatch ).toHaveBeenCalledWith(
			clearWordPressCache( 1, 'Manually clearing again.' )
		);
	} );

	it( 'shows the Clear Cache button', () => {
		jest.mocked( useEdgeCacheQuery ).mockReturnValue( { data: true, isLoading: true } );
		jest
			.mocked( useClearEdgeCacheMutation )
			.mockReturnValue( { mutate: jest.fn(), isPending: false } );

		renderWithProvider();

		expect( screen.queryByText( 'Clear all caches' ) ).toBeTruthy();
	} );

	it( 'clears object cache', async () => {
		jest.mocked( useEdgeCacheQuery ).mockReturnValue( { data: true, isLoading: false } );

		const mutationMock = { mutate: jest.fn(), isPending: false };
		jest.mocked( useClearEdgeCacheMutation ).mockReturnValue( mutationMock );

		const mockedDispatch = jest.fn();
		jest.mocked( useDispatch ).mockReturnValue( mockedDispatch );

		renderWithProvider();

		await userEvent.click( screen.getByText( 'Clear object cache' ) );

		expect( mutationMock.mutate ).not.toHaveBeenCalled();
		expect( mockedDispatch ).toHaveBeenCalledWith(
			clearWordPressCache( 1, 'Manually clearing again.' )
		);
	} );

	it( 'clears edge cache', async () => {
		jest.mocked( useEdgeCacheQuery ).mockReturnValue( { data: true, isLoading: false } );

		const mutationMock = { mutate: jest.fn(), isPending: false };
		jest.mocked( useClearEdgeCacheMutation ).mockReturnValue( mutationMock );

		const mockedDispatch = jest.fn();
		jest.mocked( useDispatch ).mockReturnValue( mockedDispatch );

		renderWithProvider();

		await userEvent.click( screen.getByText( 'Clear edge cache' ) );

		expect( mutationMock.mutate ).toHaveBeenCalledTimes( 1 );
		expect( mockedDispatch ).not.toHaveBeenCalledWith(
			clearWordPressCache( 1, 'Manually clearing again.' )
		);
	} );
} );

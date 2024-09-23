/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	useEdgeCacheQuery,
	useSetEdgeCacheMutation,
	useIsSetEdgeCacheMutating,
	useClearEdgeCacheMutation,
} from 'calypso/data/hosting/use-cache';
import CacheCard from 'calypso/hosting/server-settings/components/cache-card';
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

jest.mock( 'calypso/state/selectors/get-request' );
getRequest.mockReturnValue( { isLoading: false } );

jest.mock( 'calypso/state/selectors/should-rate-limit-atomic-cache-clear' );
shouldRateLimitAtomicCacheClear.mockReturnValue( false );

jest.mock( 'calypso/state/hosting/actions' );

const defaultProps: React.ComponentProps< typeof CacheCard > = {
	disabled: false,
};

describe( 'CacheCard component', () => {
	beforeAll( () => {
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
		shouldRateLimitAtomicCacheClear.mockReturnValueOnce( true );

		render(
			<Provider store={ store }>
				<CacheCard { ...defaultProps } />
			</Provider>
		);
		expect( screen.getByText( /you cleared the cache recently/i ) ).toBeInTheDocument();
	} );

	it( 'disables "Clear cache" button when isClearingCache prop is true', () => {
		useEdgeCacheQuery.mockReturnValue( { data: false, isLoading: false } );
		getRequest.mockReturnValueOnce( { isLoading: true } );

		render(
			<Provider store={ store }>
				<CacheCard { ...defaultProps } />
			</Provider>
		);
		expect( screen.queryByText( 'Clear all caches' ) ).toBeDisabled();
	} );

	it( 'clears cache', async () => {
		useEdgeCacheQuery.mockReturnValue( { data: true, isLoading: false } );

		const mutationMock = {
			clearEdgeCache: jest.fn(),
			isLoading: false,
		};
		useClearEdgeCacheMutation.mockReturnValue( mutationMock );

		const mockedDispatch = jest.fn();
		useDispatch.mockReturnValueOnce( mockedDispatch );

		render(
			<Provider store={ store }>
				<CacheCard { ...defaultProps } />
			</Provider>
		);

		await userEvent.click( screen.queryByText( 'Clear all caches' ) );

		expect( mutationMock.clearEdgeCache ).toHaveBeenCalledTimes( 1 );
		expect( mockedDispatch ).toHaveBeenCalledWith(
			clearWordPressCache( 1, 'Manually clearing again.' )
		);
	} );

	it( 'shows the Clear Cache button', () => {
		useEdgeCacheQuery.mockReturnValue( { data: true, isLoading: true } );
		useClearEdgeCacheMutation.mockReturnValue( {
			clearEdgeCache: jest.fn(),
			isLoading: false,
		} );
		render(
			<Provider store={ store }>
				<CacheCard { ...defaultProps } />
			</Provider>
		);
		expect( screen.queryByText( 'Clear all caches' ) ).toBeTruthy();
		expect( screen.queryByText( 'Clear all caches' ) ).toBeDisabled();
	} );
} );

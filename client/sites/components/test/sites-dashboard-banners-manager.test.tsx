/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SitesDashboardBannersManager from '../sites-dashboard-banners-manager';
import type { Status } from '@automattic/sites/src/use-sites-list-grouping';

// Mock the Banner component
jest.mock( 'calypso/components/banner', () => {
	return jest.fn( ( { title } ) => <div>{ title }</div> );
} );

const mockStore = configureStore();

describe( 'SitesDashboardBannersManager', () => {
	let store;

	beforeEach( () => {
		store = mockStore( {
			preferences: {
				localValues: {
					'dismissible-card-migration-pending-sites': false,
				},
			},
		} );
	} );

	it( 'renders migration banner when migration pending sites is greater than 0', () => {
		const sitesStatuses = [ { name: 'migration-pending', count: 1 } as Status ];

		const { getByText } = render(
			<Provider store={ store }>
				<SitesDashboardBannersManager sitesStatuses={ sitesStatuses } />
			</Provider>
		);

		expect( getByText( 'Stuck on your migration?' ) ).toBeInTheDocument();
	} );

	it( 'does not render migration banner if it is dismissed', () => {
		store = mockStore( {
			preferences: {
				localValues: {
					'dismissible-card-migration-pending-sites': true,
				},
			},
		} );

		const sitesStatuses = [ { name: 'migration-pending', count: 1 } as Status ];

		const { queryByText } = render(
			<Provider store={ store }>
				<SitesDashboardBannersManager sitesStatuses={ sitesStatuses } />
			</Provider>
		);

		expect( queryByText( 'Stuck on your migration?' ) ).not.toBeInTheDocument();
	} );

	it( 'renders restore sites banner when ?restored=true param exists', () => {
		// Setup URLSearchParams mock
		const urlSearchParamsGetSpy = jest.spyOn( URLSearchParams.prototype, 'get' );
		urlSearchParamsGetSpy.mockImplementation( ( param ) =>
			param === 'restored' ? 'true' : null
		);

		const { getByText } = render(
			<Provider store={ store }>
				<SitesDashboardBannersManager sitesStatuses={ [] } />
			</Provider>
		);

		expect( getByText( 'Choose which sites you’d like to restore' ) ).toBeInTheDocument();

		// Cleanup
		urlSearchParamsGetSpy.mockRestore();
	} );

	it( 'does not render restore sites banner when ?restored=true param does not exist', () => {
		const { queryByText } = render(
			<Provider store={ store }>
				<SitesDashboardBannersManager sitesStatuses={ [] } />
			</Provider>
		);
		expect( queryByText( 'Choose which sites you’d like to restore' ) ).not.toBeInTheDocument();
	} );
} );

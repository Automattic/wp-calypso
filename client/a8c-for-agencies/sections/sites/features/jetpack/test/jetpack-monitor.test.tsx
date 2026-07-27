/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { site } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/test/test-utils/constants';
import { JetpackMonitorPreview } from '../jetpack-monitor';

const mockToggleActivateMonitor = jest.fn();

jest.mock( 'calypso/jetpack-cloud/sections/agency-dashboard/hooks', () => ( {
	useToggleActivateMonitor: () => mockToggleActivateMonitor,
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( 'calypso/data/agency-dashboard/use-fetch-monitor-data', () =>
	jest.fn().mockReturnValue( { data: [ { date: '2023-04-07', status: 'up' } ] } )
);

const withMonitorActive = ( monitorActive ) => ( {
	...site,
	monitor_active: monitorActive,
	monitor_site_status: monitorActive,
	monitor_settings: {
		...site.monitor_settings,
		monitor_active: monitorActive,
		monitor_site_status: monitorActive,
	},
} );

const buildStore = ( monitorStatus ) =>
	configureStore()( {
		sites: { items: { [ site.blog_id ]: { blog_id: site.blog_id } } },
		a8cForAgencies: { agencies: {} },
		agencyDashboard: {
			siteMonitorStatus: {
				statuses: monitorStatus ? { [ site.blog_id ]: monitorStatus } : {},
			},
		},
	} );

describe( 'JetpackMonitorPreview', () => {
	it( 'keeps the uptime view once activation succeeds, without refetching the sites list', async () => {
		const queryClient = new QueryClient();
		const invalidateQueries = jest.spyOn( queryClient, 'invalidateQueries' );
		const trackEvent = jest.fn();

		const renderWith = ( monitorStatus, monitorActive ) => (
			<Provider store={ buildStore( monitorStatus ) }>
				<QueryClientProvider client={ queryClient }>
					<JetpackMonitorPreview
						site={ withMonitorActive( monitorActive ) }
						trackEvent={ trackEvent }
					/>
				</QueryClientProvider>
			</Provider>
		);

		const { rerender } = render( renderWith( undefined, false ) );

		await userEvent.click( screen.getByRole( 'button', { name: /activate monitor/i } ) );
		expect( mockToggleActivateMonitor ).toHaveBeenCalledWith( true );

		rerender( renderWith( 'loading', false ) );
		// The mutation writes monitor_active into the cached site, which re-points the preview pane.
		rerender( renderWith( 'completed', true ) );

		expect( screen.getByText( /monitor activity/i ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /activate monitor/i } ) ).not.toBeInTheDocument();
		expect( invalidateQueries ).not.toHaveBeenCalled();
	} );
} );

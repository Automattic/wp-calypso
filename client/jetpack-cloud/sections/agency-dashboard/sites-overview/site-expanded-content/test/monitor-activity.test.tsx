/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { site } from '../../test/test-utils/constants';
import MonitorActivity from '../monitor-activity';

jest.mock( 'calypso/data/agency-dashboard/use-fetch-monitor-data', () => {
	return jest.fn().mockReturnValue( {
		data: [
			{
				date: '2023-04-07',
				status: 'up',
			},
		],
	} );
} );

describe( 'MonitorActivity component', () => {
	const initialState = {
		sites: {
			items: {
				[ site.blog_id ]: {
					blog_id: site.blog_id,
				},
			},
		},
		a8cForAgencies: { agencies: {} },
	};

	const mockStore = configureStore();
	const store = mockStore( initialState );

	const queryClient = new QueryClient();
	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	const trackEvent = jest.fn();
	const hasMonitor = true;

	test( 'renders the header and content', async () => {
		render(
			<MonitorActivity
				site={ site }
				trackEvent={ trackEvent }
				hasMonitor={ hasMonitor }
				hasError={ false }
			/>,
			{
				wrapper: Wrapper,
			}
		);
		expect( screen.getByText( /monitor activity/i ) ).toBeInTheDocument();
		expect( screen.getByText( /20d ago/i ) ).toBeInTheDocument();
		expect( screen.getByText( /today/i ) ).toBeInTheDocument();
		const promise = Promise.resolve();
		await act( () => promise );
	} );

	test( 'calls the trackEvent function and toggleActivateMonitor when clicked', () => {
		const hasMonitor = false;
		render(
			<MonitorActivity
				site={ site }
				trackEvent={ trackEvent }
				hasMonitor={ hasMonitor }
				hasError={ false }
			/>,
			{
				wrapper: Wrapper,
			}
		);
		const card = screen.getByRole( 'button', {
			name: /activate monitor to see your uptime records/i,
		} );
		fireEvent.click( card );
		expect( trackEvent ).toHaveBeenCalledWith( 'expandable_block_activate_monitor_click' );
	} );
} );

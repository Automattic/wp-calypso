/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { site } from '../../../sites-overview/test/test-utils/constants';
import ToggleActivateMonitoring from '../index';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = ( property: string ) => property === 'jetpack/pro-dashboard-monitor-paid-tier';
	return config;
} );

describe( 'ToggleActivateMonitoring', () => {
	const defaultProps = {
		site,
		status: 'success',
		settings: site.monitor_settings,
		tooltip: 'Tooltip content',
		tooltipId: 'tooltip123',
		siteError: false,
		isLargeScreen: false,
	};

	const initialState = {
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

	it( 'renders the component with toggle content when checked', () => {
		render( <ToggleActivateMonitoring { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		const checkbox = screen.getByRole( 'checkbox', { name: /current schedule/i } );
		expect( checkbox ).toBeInTheDocument();
		expect( checkbox ).toBeChecked();
	} );

	it( 'renders the component with toggle content when unchecked', () => {
		render( <ToggleActivateMonitoring { ...defaultProps } status="disabled" />, {
			wrapper: Wrapper,
		} );

		const checkbox = screen.getByRole( 'checkbox' );
		expect( checkbox ).toBeInTheDocument();
		expect( checkbox ).not.toBeChecked();
	} );

	it( 'renders the component with toggle content and shows the default tooltip', () => {
		render( <ToggleActivateMonitoring { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		const button = screen.getByRole( 'button', { name: /current schedule/i } );
		expect( button ).toBeInTheDocument();
		act( () => {
			userEvent.hover( button );
		} );
		waitFor( () => {
			expect( screen.getByText( defaultProps.tooltip ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the component with toggle content and shows the SMS overlimit tooltip', () => {
		const props = {
			...defaultProps,
			settings: {
				...defaultProps.settings,
				is_over_limit: true,
			},
		};
		render( <ToggleActivateMonitoring { ...props } />, {
			wrapper: Wrapper,
		} );

		const button = screen.getByRole( 'button', { name: /alert/i } );
		expect( button ).toBeInTheDocument();
		act( () => {
			userEvent.hover( button );
		} );
		waitFor( () => {
			expect( screen.getByText( 'You have reached the SMS limit' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the component with toggle content and shows the upgrade tooltip', () => {
		const props = {
			...defaultProps,
			site: {
				...defaultProps.site,
				has_paid_agency_monitor: false,
			},
		};
		render( <ToggleActivateMonitoring { ...props } />, {
			wrapper: Wrapper,
		} );

		const button = screen.getByRole( 'button', { name: /current schedule/i } );
		expect( button ).toBeInTheDocument();
		act( () => {
			userEvent.hover( button );
		} );
		waitFor( () => {
			expect( screen.getByText( 'Maximize uptime' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the component with correct aria label for notification schedule in minutes', () => {
		render( <ToggleActivateMonitoring { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		expect(
			screen.getByRole( 'button', {
				name: 'The current notification schedule is set to 5 minutes. Click here to update the settings',
			} )
		).toBeInTheDocument();
	} );

	it( 'renders the component with correct aria label for notification schedule in hours', () => {
		const props = {
			...defaultProps,
			settings: {
				...defaultProps.settings,
				check_interval: 60,
			},
		};
		render( <ToggleActivateMonitoring { ...props } />, {
			wrapper: Wrapper,
		} );

		expect(
			screen.getByRole( 'button', {
				name: 'The current notification schedule is set to 1 hour. Click here to update the settings',
			} )
		).toBeInTheDocument();
	} );
} );

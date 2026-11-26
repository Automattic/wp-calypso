/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { vi } from 'vitest';
import { site } from '../../../sites-overview/test/test-utils/constants';
import ToggleActivateMonitoring from '../index';

vi.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	config.isEnabled = ( property: string ) => true;
	return { ...config, default: config };
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

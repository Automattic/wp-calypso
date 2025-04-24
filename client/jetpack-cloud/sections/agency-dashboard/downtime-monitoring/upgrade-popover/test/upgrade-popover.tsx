/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SitesOverviewContext from '../../../sites-overview/context';
import UpgradePopover from '../index';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => jest.fn() ),
} ) );

describe( 'UpgradePopover', () => {
	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	const defaultProps = {
		context: document.createElement( 'div' ),
		isVisible: true,
	};

	it( 'renders the component when the popover is visible and not dismissible', () => {
		render( <UpgradePopover { ...defaultProps } />, { wrapper: Wrapper } );

		expect( screen.getByText( 'Maximize uptime' ) ).toBeInTheDocument();
		expect( screen.getByText( '1 minute monitoring interval' ) ).toBeInTheDocument();
		expect( screen.getByText( 'SMS Notifications' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Multiple email recipients' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Explore' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Close' } ) ).not.toBeInTheDocument();
	} );

	it( 'calls the right methods when Explore button is clicked', () => {
		const mockShowLicenseInfo = jest.fn();
		const onClose = jest.fn();

		render(
			// We need only the showLicenseInfo function from the context
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			<SitesOverviewContext.Provider value={ { showLicenseInfo: mockShowLicenseInfo } }>
				<UpgradePopover { ...defaultProps } onClose={ onClose } />
			</SitesOverviewContext.Provider>,
			{ wrapper: Wrapper }
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Explore' } ) );
		expect( mockShowLicenseInfo ).toHaveBeenCalledWith( 'monitor' );
		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'renders an empty component when the popover is not visible', () => {
		render( <UpgradePopover { ...defaultProps } isVisible={ false } />, { wrapper: Wrapper } );
		expect( screen.queryByText( 'Maximize uptime' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the component when the popover is dismissible and show close button', () => {
		const onClose = jest.fn();
		render( <UpgradePopover dismissibleWithPreference onClose={ onClose } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		expect( screen.getByText( 'Maximize uptime' ) ).toBeInTheDocument();
		const closeButton = screen.getByRole( 'button', { name: 'Close' } );
		expect( closeButton ).toBeInTheDocument();
		fireEvent.click( closeButton );
		expect( onClose ).toHaveBeenCalled();
	} );
} );

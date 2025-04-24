/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	AllowedMonitorContactTypes,
	AllowedMonitorContactActions,
} from '../../../sites-overview/types';
import ContactEditor from '../index';

jest.mock( 'calypso/data/geo/use-geolocation-query', () => ( {
	useGeoLocationQuery: () => ( {
		isLoading: false,
		data: {},
	} ),
} ) );

describe( 'ContactEditor', () => {
	const defaultProps = {
		type: 'email' as AllowedMonitorContactTypes,
		contacts: [],
		setContacts: jest.fn(),
		setVerifiedContact: jest.fn(),
		recordEvent: jest.fn(),
		onClose: jest.fn(),
		sites: [],
	};

	const initialState = {};

	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	it( 'should render email form', () => {
		render( <ContactEditor { ...defaultProps } />, {
			wrapper: Wrapper,
		} );
		expect( screen.getByText( /add new email address/i ) ).toBeInTheDocument();
	} );

	it( 'should render sms form', () => {
		const props = {
			...defaultProps,
			type: 'sms' as AllowedMonitorContactTypes,
		};
		render( <ContactEditor { ...props } />, {
			wrapper: Wrapper,
		} );
		expect( screen.getByText( /add your phone number/i ) ).toBeInTheDocument();
	} );

	it( 'should render remove email confirmation', () => {
		const props = {
			...defaultProps,
			action: 'remove' as AllowedMonitorContactActions,
		};
		render( <ContactEditor { ...props } />, {
			wrapper: Wrapper,
		} );
		expect( screen.getByText( /remove email/i ) ).toBeInTheDocument();
	} );

	it( 'should render remove sms confirmation', () => {
		const props = {
			...defaultProps,
			action: 'remove' as AllowedMonitorContactActions,
			type: 'sms' as AllowedMonitorContactTypes,
		};
		render( <ContactEditor { ...props } />, {
			wrapper: Wrapper,
		} );
		expect( screen.getByText( /remove phone number/i ) ).toBeInTheDocument();
	} );
} );

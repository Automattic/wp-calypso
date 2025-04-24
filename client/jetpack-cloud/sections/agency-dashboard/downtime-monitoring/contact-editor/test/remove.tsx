/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RemoveContactForm from '../remove';

jest.mock( 'calypso/data/geo/use-geolocation-query', () => ( {
	useGeoLocationQuery: () => ( {
		isLoading: false,
		data: {},
	} ),
} ) );

describe( 'RemoveContactForm', () => {
	const initialState = {};

	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	const onCancelMock = jest.fn();
	const onRemoveMock = jest.fn();

	it( 'should render remove email form', () => {
		const contact = {
			email: 'test@test.com',
			name: 'test',
			verified: true,
		};

		render(
			<RemoveContactForm
				contact={ contact }
				onCancel={ onCancelMock }
				onRemove={ onRemoveMock }
				type="email"
			/>,
			{
				wrapper: Wrapper,
			}
		);

		expect( screen.getByText( 'test@test.com' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByText( /remove/i ) );
		expect( onRemoveMock ).toHaveBeenCalled();

		fireEvent.click( screen.getByText( /back/i ) );
		expect( onCancelMock ).toHaveBeenCalled();
	} );

	it( 'should render remove sms form', () => {
		const contact = {
			name: 'test',
			countryCode: 'AF',
			countryNumericCode: '+93',
			phoneNumber: '774405234',
			phoneNumberFull: '+93774405234',
			verified: true,
		};

		render(
			<RemoveContactForm
				contact={ contact }
				onCancel={ onCancelMock }
				onRemove={ onRemoveMock }
				type="sms"
			/>,
			{
				wrapper: Wrapper,
			}
		);

		expect( screen.getByText( '+93774405234' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByText( /remove/i ) );
		expect( onRemoveMock ).toHaveBeenCalled();

		fireEvent.click( screen.getByText( /back/i ) );
		expect( onCancelMock ).toHaveBeenCalled();
	} );
} );

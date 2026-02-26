/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from '../../subscription-manager-context';
import AddSitesForm from '../add-sites-form';

jest.mock( '@automattic/calypso-router' );

type Props = React.ComponentProps< typeof AddSitesForm >;

const renderWithContextProvider = ( component: React.ReactNode ) => {
	return renderWithProvider(
		<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
			{ component }
		</SubscriptionManagerContextProvider>
	);
};

describe( 'AddSitesForm', () => {
	const mockProps: Props = {
		onChangeSubscribe: jest.fn(),
		source: 'test-source',
	};

	it( 'calls onChange when input value changes', async () => {
		const onChange = jest.fn();
		const inputValue = 'test';

		renderWithContextProvider( <AddSitesForm { ...mockProps } onChange={ onChange } /> );

		const input = screen.getByRole( 'textbox' );
		await userEvent.type( input, inputValue );

		expect( onChange ).toHaveBeenLastCalledWith( inputValue );
	} );

	it( 'displays an error message with invalid URL', async () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		await userEvent.type( input, 'not-a-url' );
		await userEvent.tab();

		expect( screen.getByText( 'Please enter a valid URL' ) ).toBeInTheDocument();
	} );

	it( 'does not display an error message with valid URL', async () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		await userEvent.type( input, 'https://www.valid-url.com' );
		await userEvent.tab();

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	it( 'does not display an error message when input field is empty and blurred', async () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		await userEvent.click( input );
		await userEvent.tab();

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	it( 'displays a check icon when a valid URL is entered', async () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		await userEvent.type( input, 'https://www.valid-url.com' );
		await userEvent.tab();

		const checkIcon = screen.getByTestId( 'check-icon' );
		expect( checkIcon ).toBeInTheDocument();
	} );

	it( 'disables the Add site button when an invalid URL is entered', async () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );
		const addButton = screen.getByRole( 'button', { name: 'Add site' } );

		await userEvent.type( input, 'not-a-url' );
		await userEvent.tab();

		expect( addButton ).toBeDisabled();
	} );
} );

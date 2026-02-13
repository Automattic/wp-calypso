/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from '../../subscription-manager-context';
import AddSitesForm, { AddSitesFormProps } from '../add-sites-form';

jest.mock( '@automattic/calypso-router' );

const renderWithContextProvider = ( component: React.ReactNode ) => {
	return renderWithProvider(
		<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
			{ component }
		</SubscriptionManagerContextProvider>
	);
};

describe( 'AddSitesForm', () => {
	const mockProps: AddSitesFormProps = {
		onChangeSubscribe: jest.fn(),
		source: 'test-source',
	};

	test( 'displays an error message with invalid URL', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		fireEvent.change( input, {
			target: { value: 'not-a-url' },
		} );

		fireEvent.blur( input );

		expect( screen.getByText( 'Please enter a valid URL' ) ).toBeInTheDocument();
	} );

	test( 'does not display an error message with valid URL', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		fireEvent.change( input, {
			target: { value: 'https://www.valid-url.com' },
		} );

		fireEvent.blur( input );

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	test( 'does not display an error message when input field is empty and blurred', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		fireEvent.change( input, {
			target: { value: '' },
		} );

		fireEvent.blur( input );

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	test( 'displays a check icon when a valid URL is entered', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		fireEvent.change( input, {
			target: { value: 'https://www.valid-url.com' },
		} );

		fireEvent.blur( input );

		const checkIcon = screen.getByTestId( 'check-icon' );
		expect( checkIcon ).toBeInTheDocument();
	} );

	test( 'disables the Add site button when an invalid URL is entered', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );
		const addButton = screen.getByRole( 'button', { name: 'Add site' } );

		fireEvent.change( input, {
			target: { value: 'not-a-url' },
		} );

		fireEvent.blur( input );

		expect( addButton ).toBeDisabled();
	} );

	describe( 'transformUrl prop', () => {
		test( 'calls transformUrl with the input value', () => {
			const transformUrl = jest.fn( ( url: string ) => `${ url }/transformed` );
			renderWithContextProvider( <AddSitesForm { ...mockProps } transformUrl={ transformUrl } /> );

			const input = screen.getByRole( 'textbox' );
			fireEvent.change( input, { target: { value: 'https://www.example.com' } } );
			fireEvent.blur( input );

			expect( transformUrl ).toHaveBeenCalledWith( 'https://www.example.com' );
			expect( transformUrl ).toHaveReturnedWith( 'https://www.example.com/transformed' );
		} );

		test( 'does not call transformUrl when input is empty', () => {
			const transformUrl = jest.fn( ( url: string ) => `${ url }/transformed` );
			renderWithContextProvider( <AddSitesForm { ...mockProps } transformUrl={ transformUrl } /> );

			const input = screen.getByRole( 'textbox' );
			fireEvent.change( input, { target: { value: '' } } );
			fireEvent.blur( input );

			expect( transformUrl ).not.toHaveBeenCalled();
		} );
	} );
} );

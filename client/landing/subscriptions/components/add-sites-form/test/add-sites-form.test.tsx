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
		const input = screen.getByRole( 'searchbox' );

		fireEvent.change( input, {
			target: { value: 'not-a-url' },
		} );

		fireEvent.blur( input );

		expect( screen.getByText( 'Please enter a valid URL' ) ).toBeInTheDocument();
	} );

	test( 'does not display an error message with valid URL', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'searchbox' );

		fireEvent.change( input, {
			target: { value: 'https://www.valid-url.com' },
		} );

		fireEvent.blur( input );

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	test( 'does not display an error message when input field is empty and blurred', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'searchbox' );

		fireEvent.change( input, {
			target: { value: '' },
		} );

		fireEvent.blur( input );

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	test( 'disables the Add site button when an invalid URL is entered', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'searchbox' );
		const addButton = screen.getByRole( 'button', { name: 'Add site' } );

		fireEvent.change( input, {
			target: { value: 'not-a-url' },
		} );

		fireEvent.blur( input );

		expect( addButton ).toBeDisabled();
	} );

	test( 'disables the Add site button immediately when typing invalid URL', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'searchbox' );
		const addButton = screen.getByRole( 'button', { name: 'Add site' } );

		fireEvent.change( input, { target: { value: 'not-a-valid-url' } } );

		expect( addButton ).toBeDisabled();
	} );

	test( 'enables the Add site button immediately when typing valid URL', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'searchbox' );
		const addButton = screen.getByRole( 'button', { name: 'Add site' } );

		fireEvent.change( input, { target: { value: 'https://example.com' } } );

		expect( addButton ).toBeEnabled();
	} );

	test( 'disables the Add site button when input is empty', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const addButton = screen.getByRole( 'button', { name: 'Add site' } );

		expect( addButton ).toBeDisabled();
	} );

	test( 'disables button when transitioning from valid to invalid URL', () => {
		renderWithContextProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'searchbox' );
		const addButton = screen.getByRole( 'button', { name: 'Add site' } );

		fireEvent.change( input, { target: { value: 'https://example.com' } } );
		expect( addButton ).toBeEnabled();

		fireEvent.change( input, { target: { value: 'invalid' } } );
		expect( addButton ).toBeDisabled();
	} );
} );

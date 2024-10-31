/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LinkWithRedirect } from '../';

const originalLocation = window.location;

describe( 'LinkWithRedirect', () => {
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	it( 'renders the link when it is available', () => {
		const { getByRole } = render(
			<LinkWithRedirect href="https://example.com">Click me</LinkWithRedirect>
		);

		expect( getByRole( 'link' ) ).toHaveAttribute( 'href', 'https://example.com' );
	} );

	it( 'renders `redirecting` when the user clicks but the link is not available', async () => {
		const { getByText, findByText } = render(
			<LinkWithRedirect href={ null }>Click me</LinkWithRedirect>
		);

		userEvent.click( getByText( 'Click me' ) );

		expect( await findByText( 'Redirecting' ) ).toBeVisible();
	} );

	it( 'redirects user to the link when is available after the redirecting state', async () => {
		const { getByText, rerender, findByText } = render(
			<LinkWithRedirect href={ null }>Click me</LinkWithRedirect>
		);

		userEvent.click( getByText( 'Click me' ) );

		expect( await findByText( 'Redirecting' ) ).toBeVisible();

		rerender( <LinkWithRedirect href="https://example.com">Click me</LinkWithRedirect> );

		await waitFor( () => expect( window.location.assign ).toHaveBeenCalled() );
	} );
} );

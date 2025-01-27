/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BackButton } from '../back-button';

const mockNavigate = jest.fn();
jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useNavigate: () => mockNavigate,
} ) );

const testEntries = [ { pathname: '/' }, { pathname: '/contact-form' } ];

describe( 'BackButton', () => {
	afterEach( () => {
		mockNavigate.mockClear();
	} );

	it( 'navigates to the previous page by default', async () => {
		const user = userEvent.setup();

		render(
			<MemoryRouter initialEntries={ testEntries }>
				<BackButton />
			</MemoryRouter>
		);

		await user.click( screen.getByTestId( 'help-center-back-button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( -1 );
	} );

	it( 'does not navigate if user is already on homepage', async () => {
		const user = userEvent.setup();

		render(
			<MemoryRouter>
				<BackButton />
			</MemoryRouter>
		);

		await user.click( screen.getByTestId( 'help-center-back-button' ) );

		expect( mockNavigate ).not.toHaveBeenCalledWith( '/' );
	} );
} );

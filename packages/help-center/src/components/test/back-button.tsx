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

	it( 'navigates to the root when back to root is true', async () => {
		const user = userEvent.setup();

		render(
			<MemoryRouter initialEntries={ testEntries }>
				<BackButton backToRoot />
			</MemoryRouter>
		);

		await user.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( '/' );
	} );

	it( 'navigates to the previous page by default', async () => {
		const user = userEvent.setup();

		render(
			<MemoryRouter initialEntries={ testEntries }>
				<BackButton />
			</MemoryRouter>
		);

		await user.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( -1 );
	} );

	it( "navigates to root when there's no history", async () => {
		const user = userEvent.setup();

		render(
			<MemoryRouter>
				<BackButton />
			</MemoryRouter>
		);

		await user.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( '/' );
	} );

	it( 'calls a custom onClick handler when defined instead of modifying history', async () => {
		const user = userEvent.setup();
		const onClickSpy = jest.fn();

		render(
			<MemoryRouter initialEntries={ testEntries }>
				<BackButton onClick={ onClickSpy } />
			</MemoryRouter>
		);

		await user.click( screen.getByRole( 'button' ) );

		expect( onClickSpy ).toHaveBeenCalled();
		expect( mockNavigate ).not.toHaveBeenCalled();
	} );
} );

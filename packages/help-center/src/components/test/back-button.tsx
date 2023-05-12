/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BackButton } from '../back-button';

const mockNavigate = jest.fn();
jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useNavigate: () => mockNavigate,
	useLocation: jest.fn().mockImplementation( () => ( {
		key: 'somethingrandom',
	} ) ),
} ) );

describe( 'BackButton', () => {
	afterEach( () => {
		mockNavigate.mockClear();
	} );

	it( 'navigates to the root when back to root is true', async () => {
		const user = userEvent.setup();

		render( <BackButton backToRoot /> );

		await user.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( '/' );
	} );

	it( 'navigates to the previous page by default', async () => {
		const user = userEvent.setup();

		render( <BackButton /> );

		await user.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( -1 );
	} );

	it( "navigates to root when there's no history", async () => {
		const user = userEvent.setup();
		jest.mock( 'react-router-dom', () => ( {
			useLocation: jest.fn().mockImplementation( () => ( {
				key: 'default',
			} ) ),
		} ) );

		render( <BackButton /> );

		await user.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( '/' );
	} );

	it( 'calls a custom onClick handler when defined instead of modifying history', async () => {
		const user = userEvent.setup();
		const onClickSpy = jest.fn();

		render( <BackButton onClick={ onClickSpy } /> );

		await user.click( screen.getByRole( 'button' ) );

		expect( onClickSpy ).toHaveBeenCalled();
		expect( mockNavigate ).not.toHaveBeenCalled();
	} );
} );

/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackButton } from '../back-button';

const mockHistoryPush = jest.fn();
const mockHistoryGoBack = jest.fn();
jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useHistory: () => ( {
		push: mockHistoryPush,
		goBack: mockHistoryGoBack,
	} ),
} ) );

describe( 'BackButton', () => {
	afterEach( () => {
		mockHistoryGoBack.mockClear();
		mockHistoryPush.mockClear();
	} );

	it( 'navigates to the root when back to root is true', async () => {
		render( <BackButton backToRoot /> );

		const btn = screen.getByRole( 'button' );
		await userEvent.click( btn );

		expect( mockHistoryPush ).toHaveBeenCalledWith( '/' );
	} );

	it( 'navigates to the previous page by default', async () => {
		render( <BackButton /> );

		const btn = screen.getByRole( 'button' );
		await userEvent.click( btn );

		expect( mockHistoryGoBack ).toHaveBeenCalled();
	} );

	it( 'calls a custom onClick handler when defined instead of modifying history', async () => {
		const onClickSpy = jest.fn();
		render( <BackButton onClick={ onClickSpy } /> );

		const btn = screen.getByRole( 'button' );
		await userEvent.click( btn );

		expect( onClickSpy ).toHaveBeenCalled();
		expect( mockHistoryGoBack ).not.toHaveBeenCalled();
		expect( mockHistoryPush ).not.toHaveBeenCalled();
	} );
} );

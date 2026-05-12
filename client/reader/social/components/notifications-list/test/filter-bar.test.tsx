/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { NotificationsFilterBar } from '../filter-bar';

describe( 'NotificationsFilterBar', () => {
	it( 'renders all five chips with "All" selected by default', () => {
		const onChange = jest.fn();
		renderWithProvider( <NotificationsFilterBar value="all" onChange={ onChange } /> );
		expect( screen.getByRole( 'button', { name: /^all$/i } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( screen.getByRole( 'button', { name: /^conversations$/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^likes$/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^reposts$/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^follows$/i } ) ).toBeVisible();
	} );

	it( 'calls onChange with the next filter on click', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		renderWithProvider( <NotificationsFilterBar value="all" onChange={ onChange } /> );
		await user.click( screen.getByRole( 'button', { name: /^likes$/i } ) );
		expect( onChange ).toHaveBeenCalledWith( 'likes' );
	} );

	it( 'marks the active chip as pressed', () => {
		const onChange = jest.fn();
		renderWithProvider( <NotificationsFilterBar value="follows" onChange={ onChange } /> );
		expect( screen.getByRole( 'button', { name: /^follows$/i } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	} );

	it( 'has an aria-label on the group', () => {
		const onChange = jest.fn();
		renderWithProvider( <NotificationsFilterBar value="all" onChange={ onChange } /> );
		expect( screen.getByRole( 'group', { name: /filter notifications by type/i } ) ).toBeVisible();
	} );
} );

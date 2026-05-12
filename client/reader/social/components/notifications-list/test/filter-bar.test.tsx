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
		expect( screen.getByRole( 'radio', { name: /^all$/i } ) ).toHaveAttribute(
			'aria-checked',
			'true'
		);
		expect( screen.getByRole( 'radio', { name: /^conversations$/i } ) ).toBeVisible();
		expect( screen.getByRole( 'radio', { name: /^likes$/i } ) ).toBeVisible();
		expect( screen.getByRole( 'radio', { name: /^reposts$/i } ) ).toBeVisible();
		expect( screen.getByRole( 'radio', { name: /^follows$/i } ) ).toBeVisible();
	} );

	it( 'calls onChange with the next filter on click', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		renderWithProvider( <NotificationsFilterBar value="all" onChange={ onChange } /> );
		await user.click( screen.getByRole( 'radio', { name: /^likes$/i } ) );
		expect( onChange ).toHaveBeenCalledWith( 'likes' );
	} );

	it( 'marks the active chip as checked', () => {
		const onChange = jest.fn();
		renderWithProvider( <NotificationsFilterBar value="follows" onChange={ onChange } /> );
		expect( screen.getByRole( 'radio', { name: /^follows$/i } ) ).toHaveAttribute(
			'aria-checked',
			'true'
		);
	} );

	it( 'has an aria-label on the group', () => {
		const onChange = jest.fn();
		renderWithProvider( <NotificationsFilterBar value="all" onChange={ onChange } /> );
		expect(
			screen.getByRole( 'radiogroup', { name: /filter notifications by type/i } )
		).toBeVisible();
	} );
} );

/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EarlyReadersModal } from '../index';

describe( 'EarlyReadersModal', () => {
	it( 'renders the opt-in intro', () => {
		render( <EarlyReadersModal onDecline={ jest.fn() } /> );

		expect( screen.getByRole( 'heading', { name: 'Get your first readers' } ) ).toBeVisible();
	} );

	it( 'calls onDecline when "No thanks" is clicked', async () => {
		const user = userEvent.setup();
		const onDecline = jest.fn();
		render( <EarlyReadersModal onDecline={ onDecline } /> );

		await user.click( screen.getByRole( 'button', { name: 'No thanks' } ) );

		expect( onDecline ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables Join until an interest is selected', () => {
		render( <EarlyReadersModal onDecline={ jest.fn() } /> );

		expect( screen.getByRole( 'button', { name: 'Join Early Readers' } ) ).toBeDisabled();
	} );
} );

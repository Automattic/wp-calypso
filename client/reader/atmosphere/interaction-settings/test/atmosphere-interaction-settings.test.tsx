/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtmosphereInteractionSettings } from '../atmosphere-interaction-settings';

describe( 'AtmosphereInteractionSettings', () => {
	it( 'renders the heading, who-can-reply radios, three combo checkboxes, the quotes toggle, and Save', () => {
		render(
			<AtmosphereInteractionSettings
				initialReplyAllow={ { kind: 'anyone' } }
				initialAllowQuotes
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'Post interaction settings' } ) ).toBeVisible();
		expect( screen.getByRole( 'radio', { name: 'Anyone' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Nobody' } ) ).not.toBeChecked();
		expect( screen.getByRole( 'checkbox', { name: 'Your followers' } ) ).not.toBeChecked();
		expect( screen.getByRole( 'checkbox', { name: 'People you follow' } ) ).not.toBeChecked();
		expect( screen.getByRole( 'checkbox', { name: 'People you mention' } ) ).not.toBeChecked();
		expect( screen.getByRole( 'checkbox', { name: 'Allow quote posts' } ) ).toBeChecked();
		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeVisible();
	} );

	it( 'stages changes locally — onSave is the only commit path', async () => {
		const user = userEvent.setup();
		const onSave = jest.fn();
		render(
			<AtmosphereInteractionSettings
				initialReplyAllow={ { kind: 'anyone' } }
				initialAllowQuotes
				onSave={ onSave }
			/>
		);

		await user.click( screen.getByRole( 'checkbox', { name: 'People you follow' } ) );
		await user.click( screen.getByRole( 'checkbox', { name: 'Allow quote posts' } ) );
		expect( onSave ).not.toHaveBeenCalled();

		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
		expect( onSave ).toHaveBeenCalledWith(
			{ kind: 'combo', follower: false, following: true, mention: false },
			false
		);
	} );

	it( 'switching to Nobody clears combo flags and disables combo checkboxes', async () => {
		const user = userEvent.setup();
		render(
			<AtmosphereInteractionSettings
				initialReplyAllow={ {
					kind: 'combo',
					follower: true,
					following: false,
					mention: false,
				} }
				initialAllowQuotes
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'checkbox', { name: 'Your followers' } ) ).toBeChecked();
		await user.click( screen.getByRole( 'radio', { name: 'Nobody' } ) );
		expect( screen.getByRole( 'checkbox', { name: 'Your followers' } ) ).not.toBeChecked();
		expect( screen.getByRole( 'checkbox', { name: 'Your followers' } ) ).toBeDisabled();
	} );

	it( 'unchecking the last combo flag returns to Anyone', async () => {
		const user = userEvent.setup();
		const onSave = jest.fn();
		render(
			<AtmosphereInteractionSettings
				initialReplyAllow={ {
					kind: 'combo',
					follower: false,
					following: true,
					mention: false,
				} }
				initialAllowQuotes
				onSave={ onSave }
			/>
		);

		await user.click( screen.getByRole( 'checkbox', { name: 'People you follow' } ) );
		expect( screen.getByRole( 'radio', { name: 'Anyone' } ) ).toBeChecked();

		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
		expect( onSave ).toHaveBeenCalledWith( { kind: 'anyone' }, true );
	} );
} );

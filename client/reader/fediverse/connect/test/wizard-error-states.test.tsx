/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardErrorStates } from '../wizard-error-states';
import { INITIAL_STATE } from '../wizard-state-machine';
import type { WizardState } from '../wizard-types';

function makeErrorState( overrides: Partial< WizardState > = {} ): WizardState {
	return { ...INITIAL_STATE, name: 'ERROR', ...overrides };
}

describe( 'WizardErrorStates', () => {
	describe( 'error copy by errorStep', () => {
		it( 'shows the capability_check copy', () => {
			const state = makeErrorState( { errorStep: 'capability_check' } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect( screen.getByText( /reach this site/i ) ).toBeVisible();
		} );

		it( 'shows the enable_feature copy', () => {
			const state = makeErrorState( { errorStep: 'enable_feature' } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect( screen.getByText( /enable ActivityPub on this site/i ) ).toBeVisible();
		} );

		it( 'shows the enable_c2s copy', () => {
			const state = makeErrorState( { errorStep: 'enable_c2s' } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect( screen.getByText( /enable the C2S posting API/i ) ).toBeVisible();
		} );

		it( 'shows the enable_user_actors copy', () => {
			const state = makeErrorState( { errorStep: 'enable_user_actors' } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect( screen.getByText( /enable per-user accounts/i ) ).toBeVisible();
		} );

		it( 'shows the authorize copy', () => {
			const state = makeErrorState( { errorStep: 'authorize' } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect( screen.getByText( /connection failed during authorization/i ) ).toBeVisible();
		} );

		it( 'shows the permission_denied copy', () => {
			const state = makeErrorState( { errorStep: 'permission_denied' } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect(
				screen.getByText( /ask a site administrator to enable Fediverse posting/i )
			).toBeVisible();
		} );
	} );

	describe( 'errorMessage display', () => {
		it( 'shows errorMessage when non-empty', () => {
			const state = makeErrorState( {
				errorStep: 'capability_check',
				errorMessage: 'network timeout',
			} );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect( screen.getByText( 'network timeout' ) ).toBeVisible();
		} );

		it( 'does not show an error message paragraph when errorMessage is null', () => {
			const state = makeErrorState( { errorStep: 'capability_check', errorMessage: null } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			// Only the title paragraph should be visible; the message paragraph should be absent.
			expect( screen.queryByText( /network timeout/i ) ).toBeNull();
		} );
	} );

	describe( 'retry button', () => {
		const retrySteps = [
			'capability_check',
			'enable_feature',
			'enable_c2s',
			'enable_user_actors',
			'authorize',
		] as const;

		it.each( retrySteps )( 'shows a retry button for errorStep %s', ( errorStep ) => {
			const state = makeErrorState( { errorStep } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /try again/i } ) ).toBeVisible();
		} );

		it( 'calls onRetry when retry button is clicked', async () => {
			const user = userEvent.setup();
			const onRetry = jest.fn();
			const state = makeErrorState( { errorStep: 'capability_check' } );
			render( <WizardErrorStates state={ state } onRetry={ onRetry } onReset={ jest.fn() } /> );
			await user.click( screen.getByRole( 'button', { name: /try again/i } ) );
			expect( onRetry ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'reset button', () => {
		it( 'shows a "Pick a different site" button for permission_denied', () => {
			const state = makeErrorState( { errorStep: 'permission_denied' } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /pick a different site/i } ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /try again/i } ) ).toBeNull();
		} );

		it( 'calls onReset when "Pick a different site" is clicked', async () => {
			const user = userEvent.setup();
			const onReset = jest.fn();
			const state = makeErrorState( { errorStep: 'permission_denied' } );
			render( <WizardErrorStates state={ state } onRetry={ jest.fn() } onReset={ onReset } /> );
			await user.click( screen.getByRole( 'button', { name: /pick a different site/i } ) );
			expect( onReset ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );

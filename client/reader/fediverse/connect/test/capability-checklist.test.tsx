/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapabilityChecklist } from '../capability-checklist';
import { INITIAL_STATE } from '../wizard-state-machine';
import type { WizardState } from '../wizard-types';
import type { FediverseSiteCapabilities } from '@automattic/api-core';

function makeCaps(
	overrides: Partial< FediverseSiteCapabilities > = {}
): FediverseSiteCapabilities {
	return {
		activitypub_active: true,
		c2s_enabled: true,
		actors: {
			user: { enabled: true, can_enable: true },
			blog: { enabled: false, can_enable: true },
		},
		oauth_metadata: null,
		site_host: 'example.com',
		site_kind: 'wpcom',
		current_user_can_publish: true,
		...overrides,
	};
}

function makeState( overrides: Partial< WizardState > = {} ): WizardState {
	return { ...INITIAL_STATE, ...overrides };
}

describe( 'CapabilityChecklist', () => {
	describe( 'loading state', () => {
		it( 'renders a spinner while capabilities are loading', () => {
			const state = makeState( { name: 'CHECKING_CAPABILITIES', capabilities: null } );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByRole( 'presentation' ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /enable & connect/i } ) ).toBeNull();
		} );
	} );

	describe( 'checklist rows', () => {
		it( 'shows "Enable ActivityPub feature" for wpcom sites', () => {
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps( { site_kind: 'wpcom' } ),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByText( /enable activitypub feature/i ) ).toBeVisible();
		} );

		it( 'shows "Install ActivityPub plugin" for jetpack sites', () => {
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps( { site_kind: 'jetpack' } ),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByText( /install activitypub plugin/i ) ).toBeVisible();
		} );

		it( 'shows the C2S row label', () => {
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps(),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByText( /enable client-to-server posting api/i ) ).toBeVisible();
		} );

		it( 'shows the per-user accounts row label', () => {
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps(),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByText( /enable per-user accounts/i ) ).toBeVisible();
		} );

		it( 'shows the authorize row with site host placeholder', () => {
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps( { site_host: 'my.site.com' } ),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByText( /@you@my\.site\.com/i ) ).toBeVisible();
		} );
	} );

	describe( 'button state', () => {
		it( 'enables the button when all capabilities are green', () => {
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps(),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).not.toBeDisabled();
		} );

		it( 'disables the button during CHECKING_CAPABILITIES when caps are present', () => {
			// Simulate re-check with prior capabilities still in state
			const state = makeState( {
				name: 'CHECKING_CAPABILITIES',
				capabilities: makeCaps(),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeDisabled();
		} );

		it( 'disables the button while ENABLING_FEATURE', () => {
			const state = makeState( {
				name: 'ENABLING_FEATURE',
				capabilities: makeCaps( { activitypub_active: false } ),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeDisabled();
		} );

		it( 'disables the button while ENABLING_C2S', () => {
			const state = makeState( {
				name: 'ENABLING_C2S',
				capabilities: makeCaps( { c2s_enabled: false } ),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeDisabled();
		} );

		it( 'disables the button while ENABLING_USER_ACTORS', () => {
			const state = makeState( {
				name: 'ENABLING_USER_ACTORS',
				capabilities: makeCaps( {
					actors: {
						user: { enabled: false, can_enable: true },
						blog: { enabled: false, can_enable: true },
					},
				} ),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeDisabled();
		} );

		it( 'disables the button with publish-permission message when current_user_can_publish is false', () => {
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps( { current_user_can_publish: false } ),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeDisabled();
			expect( screen.getByText( /you need permission to publish/i ) ).toBeVisible();
		} );

		it( 'disables the button with admin-permission message when actors.user.can_enable is false', () => {
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps( {
					current_user_can_publish: true,
					actors: {
						user: { enabled: false, can_enable: false },
						blog: { enabled: false, can_enable: true },
					},
				} ),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ jest.fn() } /> );
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeDisabled();
			expect( screen.getByText( /administrator permissions/i ) ).toBeVisible();
		} );
	} );

	describe( 'button interaction', () => {
		it( 'calls onConnect when the button is clicked', async () => {
			const user = userEvent.setup();
			const onConnect = jest.fn();
			const state = makeState( {
				name: 'CHECKLIST_READY',
				capabilities: makeCaps(),
			} );
			render( <CapabilityChecklist state={ state } onConnect={ onConnect } /> );
			await user.click( screen.getByRole( 'button', { name: /enable & connect/i } ) );
			expect( onConnect ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );

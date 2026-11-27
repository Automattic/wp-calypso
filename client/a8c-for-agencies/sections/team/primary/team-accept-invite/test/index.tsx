/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import a8cForAgencies from 'calypso/state/a8c-for-agencies/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import TeamAcceptInvite from '../index';
import type { ReactNode } from 'react';

vi.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( vi.fn(), { redirect: vi.fn() } ),
} ) );

vi.mock( 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour', () => ( {
	LayoutWithGuidedTour: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );

vi.mock( 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification', () => ( {
	__esModule: true,
	default: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );

vi.mock( 'calypso/a8c-for-agencies/hooks/use-help-center', () => ( {
	__esModule: true,
	default: () => ( { showSupportGuide: vi.fn() } ),
} ) );

const { activateMember } = vi.hoisted( () => {
	const mutate = ( _params: unknown, { onError }: { onError: ( error: unknown ) => void } ) =>
		onError( {
			status: 403,
			code: 'a4a_user_invite_already_member_of_agency',
			message: 'You are already a member of another agency.',
			data: {
				user_agencies: [ { id: 1, name: 'Current Agency' } ],
				target_agency: { id: 5, name: 'Target Agency' },
			},
		} );
	return { activateMember: { mutate } };
} );

vi.mock( 'calypso/a8c-for-agencies/data/team/use-activate-member', () => ( {
	__esModule: true,
	default: () => activateMember,
} ) );

function renderAcceptInvite( role: 'a4a_administrator' | 'a4a_manager' ) {
	return renderWithProvider( <TeamAcceptInvite agencyId={ 5 } inviteId={ 7 } secret="a-secret" />, {
		initialState: {
			a8cForAgencies: {
				agencies: {
					activeAgency: { id: 1, name: 'Current Agency', user: { role, capabilities: [] } },
					isAgencyClientUser: false,
				},
			},
		},
		reducers: { a8cForAgencies },
	} );
}

describe( 'TeamAcceptInvite', () => {
	it( 'tells a team member to leave their current agency', () => {
		renderAcceptInvite( 'a4a_manager' );

		expect(
			screen.getByText( 'To join Target Agency, first leave the Current Agency dashboard.' )
		).toBeVisible();
		expect( screen.queryByText( 'Transfer ownership of Current Agency' ) ).not.toBeInTheDocument();
	} );

	it( 'tells an agency owner to transfer ownership before leaving', () => {
		renderAcceptInvite( 'a4a_administrator' );

		expect(
			screen.getByText(
				'To join Target Agency, first transfer ownership of Current Agency to another team member, then leave its dashboard.'
			)
		).toBeVisible();
		expect( screen.getByText( 'Transfer ownership of Current Agency' ) ).toBeVisible();
		expect( screen.getByText( 'Then remove yourself in the Team section.' ) ).toBeVisible();
		expect( screen.getByText( 'No other team members? Contact support for help.' ) ).toBeVisible();
	} );
} );

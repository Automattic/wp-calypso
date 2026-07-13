/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { OWNER_ROLE } from '../../constants';
import { useTeamActions } from '../actions';
import type { TeamMember } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

const CURRENT_USER_EMAIL = 'me@example.com';

const owner: TeamMember = {
	id: 1,
	email: 'owner@example.com',
	role: OWNER_ROLE,
	status: 'active',
};
const activeOther: TeamMember = {
	id: 2,
	email: 'other@example.com',
	role: 'member',
	status: 'active',
};
const activeSelf: TeamMember = {
	id: 3,
	email: CURRENT_USER_EMAIL,
	role: 'member',
	status: 'active',
};
const pendingInvite: TeamMember = { id: 4, email: 'pending@example.com', status: 'pending' };
const expiredInvite: TeamMember = { id: 5, email: 'expired@example.com', status: 'expired' };

function setup( { canRemove = true }: { canRemove?: boolean } = {} ) {
	const { result } = renderHook( () =>
		useTeamActions( {
			canRemove,
			currentUserEmail: CURRENT_USER_EMAIL,
			onResendInvite: () => {},
			onConfirmAction: () => {},
		} )
	);
	return ( id: string, item: TeamMember ) => {
		const action = result.current.find( ( a: Action< TeamMember > ) => a.id === id );
		if ( ! action || ! action.isEligible ) {
			throw new Error( `Action "${ id }" not found or has no isEligible` );
		}
		return action.isEligible( item );
	};
}

describe( 'useTeamActions eligibility', () => {
	it( 'offers no actions for the agency owner', () => {
		const isEligible = setup();
		for ( const id of [
			'resend-user-invite',
			'cancel-user-invite',
			'transfer-ownership',
			'leave-agency',
			'remove-team-member',
		] ) {
			expect( isEligible( id, owner ) ).toBe( false );
		}
	} );

	it( 'allows resend/cancel only for invited members', () => {
		const isEligible = setup();
		for ( const invite of [ pendingInvite, expiredInvite ] ) {
			expect( isEligible( 'resend-user-invite', invite ) ).toBe( true );
			expect( isEligible( 'cancel-user-invite', invite ) ).toBe( true );
			expect( isEligible( 'transfer-ownership', invite ) ).toBe( false );
			expect( isEligible( 'leave-agency', invite ) ).toBe( false );
			expect( isEligible( 'remove-team-member', invite ) ).toBe( false );
		}
		expect( isEligible( 'resend-user-invite', activeOther ) ).toBe( false );
		expect( isEligible( 'cancel-user-invite', activeOther ) ).toBe( false );
	} );

	it( 'allows transfer/remove for other active members', () => {
		const isEligible = setup();
		expect( isEligible( 'transfer-ownership', activeOther ) ).toBe( true );
		expect( isEligible( 'remove-team-member', activeOther ) ).toBe( true );
		expect( isEligible( 'leave-agency', activeOther ) ).toBe( false );
	} );

	it( 'offers leave-agency (not transfer/remove) for the current user', () => {
		const isEligible = setup();
		expect( isEligible( 'leave-agency', activeSelf ) ).toBe( true );
		expect( isEligible( 'transfer-ownership', activeSelf ) ).toBe( false );
		expect( isEligible( 'remove-team-member', activeSelf ) ).toBe( false );
	} );

	it( 'gates remove-team-member behind the remove capability', () => {
		const isEligible = setup( { canRemove: false } );
		expect( isEligible( 'remove-team-member', activeOther ) ).toBe( false );
		// Transfer stays available; it is not capability-gated.
		expect( isEligible( 'transfer-ownership', activeOther ) ).toBe( true );
	} );
} );

/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import RecoveryEmailMatchesNotice, { useShouldShowRecoveryEmailMatchesNotice } from '../index';
import type { User } from '@automattic/api-core';

const ACCOUNT_EMAIL = 'owner@example.com';

function accountUser( { matches }: { matches?: boolean } = {} ) {
	return {
		ID: 1,
		email: ACCOUNT_EMAIL,
		recovery_email_matches_account_email: matches,
	} as User;
}

// The hook is exercised through a probe component so it runs inside the same providers
// the notice has on the sites list.
function HookProbe() {
	const shouldShow = useShouldShowRecoveryEmailMatchesNotice();
	return <div>{ shouldShow ? 'should show' : 'should not show' }</div>;
}

describe( '<RecoveryEmailMatchesNotice>', () => {
	test( 'renders the warning and records an impression', async () => {
		const { recordTracksEvent } = render( <RecoveryEmailMatchesNotice />, {
			user: accountUser( { matches: true } ),
		} );

		expect(
			await screen.findByText( 'Your recovery email is the same as your account email' )
		).toBeVisible();
		expect( screen.getByText( new RegExp( ACCOUNT_EMAIL ) ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_recovery_email_matches_notice_impression',
			undefined
		);
	} );

	test( 'cannot be dismissed', async () => {
		render( <RecoveryEmailMatchesNotice />, { user: accountUser( { matches: true } ) } );

		await screen.findByText( 'Your recovery email is the same as your account email' );
		expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
	} );

	test( 'offers setting a recovery email as its only action', async () => {
		const user = userEvent.setup();

		const { recordTracksEvent } = render( <RecoveryEmailMatchesNotice />, {
			user: accountUser( { matches: true } ),
		} );

		const links = await screen.findAllByRole( 'link' );
		expect( links ).toHaveLength( 1 );
		expect( links[ 0 ] ).toHaveAccessibleName( 'Set a recovery email' );

		await user.click( links[ 0 ] );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_recovery_email_matches_notice_click'
		);
	} );

	test( 'the hook is true only when the recovery email matches the account email', async () => {
		render( <HookProbe />, { user: accountUser( { matches: true } ) } );

		expect( await screen.findByText( 'should show' ) ).toBeVisible();
	} );

	test( 'the hook is false when the field is false', async () => {
		render( <HookProbe />, { user: accountUser( { matches: false } ) } );

		expect( await screen.findByText( 'should not show' ) ).toBeVisible();
	} );

	test( 'the hook is false when the field is absent, as it is before wpcom deploys', async () => {
		render( <HookProbe />, { user: accountUser() } );

		expect( await screen.findByText( 'should not show' ) ).toBeVisible();
	} );
} );

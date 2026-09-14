/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import AccountEmailBouncingNotice, { useShouldShowAccountEmailBouncingNotice } from '../index';
import type { User } from '@automattic/api-core';

const ACCOUNT_EMAIL = 'owner@example.com';

function accountUser( { isBouncing }: { isBouncing?: boolean } = {} ) {
	return { ID: 1, email: ACCOUNT_EMAIL, email_bouncing: isBouncing } as User;
}

// The hook is exercised through a probe component so it runs inside the same providers
// the notice has on the sites list.
function HookProbe() {
	const shouldShow = useShouldShowAccountEmailBouncingNotice();
	return <div>{ shouldShow ? 'should show' : 'should not show' }</div>;
}

describe( '<AccountEmailBouncingNotice>', () => {
	test( 'renders the warning and records an impression', async () => {
		const { recordTracksEvent } = render( <AccountEmailBouncingNotice />, {
			user: accountUser( { isBouncing: true } ),
		} );

		expect(
			await screen.findByText( 'Your account email isn’t receiving our messages' )
		).toBeVisible();
		expect( screen.getByText( new RegExp( ACCOUNT_EMAIL ) ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_account_email_bouncing_notice_impression',
			undefined
		);
	} );

	test( 'cannot be dismissed', async () => {
		render( <AccountEmailBouncingNotice />, { user: accountUser( { isBouncing: true } ) } );

		await screen.findByText( 'Your account email isn’t receiving our messages' );
		expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
	} );

	test( 'offers updating the email address as its only action', async () => {
		const user = userEvent.setup();

		const { recordTracksEvent } = render( <AccountEmailBouncingNotice />, {
			user: accountUser( { isBouncing: true } ),
		} );

		const links = await screen.findAllByRole( 'link' );
		expect( links ).toHaveLength( 1 );
		expect( links[ 0 ] ).toHaveAccessibleName( 'Update your email address' );

		await user.click( links[ 0 ] );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_account_email_bouncing_notice_click'
		);
	} );

	test( 'the hook is true only when the account email is bouncing', async () => {
		render( <HookProbe />, { user: accountUser( { isBouncing: true } ) } );

		expect( await screen.findByText( 'should show' ) ).toBeVisible();
	} );

	test( 'the hook is false when the field is false', async () => {
		render( <HookProbe />, { user: accountUser( { isBouncing: false } ) } );

		expect( await screen.findByText( 'should not show' ) ).toBeVisible();
	} );

	test( 'the hook is false when the field is absent, as it is before wpcom deploys', async () => {
		render( <HookProbe />, { user: accountUser() } );

		expect( await screen.findByText( 'should not show' ) ).toBeVisible();
	} );
} );

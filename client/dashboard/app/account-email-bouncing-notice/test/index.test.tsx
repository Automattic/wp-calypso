/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AccountEmailBouncingNotice, { useShouldShowAccountEmailBouncingNotice } from '../index';
import type { UserSettings } from '@automattic/api-core';

const ACCOUNT_EMAIL = 'owner@example.com';

function mockUserSettings( data: Partial< UserSettings > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, { user_email: ACCOUNT_EMAIL, ...data } );
}

// The hook is exercised through a probe component so that the suspense boundary in render()
// applies, the same way it will on the sites list.
function HookProbe() {
	const shouldShow = useShouldShowAccountEmailBouncingNotice();
	return <div>{ shouldShow ? 'should show' : 'should not show' }</div>;
}

describe( '<AccountEmailBouncingNotice>', () => {
	test( 'renders the warning and records an impression', async () => {
		mockUserSettings( { user_email_bouncing: true } );

		const { recordTracksEvent } = render( <AccountEmailBouncingNotice /> );

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
		mockUserSettings( { user_email_bouncing: true } );

		render( <AccountEmailBouncingNotice /> );

		await screen.findByText( 'Your account email isn’t receiving our messages' );
		expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
	} );

	test( 'records which CTA was followed', async () => {
		mockUserSettings( { user_email_bouncing: true } );
		const user = userEvent.setup();

		const { recordTracksEvent } = render( <AccountEmailBouncingNotice /> );

		await user.click( await screen.findByRole( 'link', { name: 'Update your email address' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_account_email_bouncing_notice_click',
			{ cta: 'update_email' }
		);

		await user.click( screen.getByRole( 'link', { name: 'Add a recovery email' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_account_email_bouncing_notice_click',
			{ cta: 'add_recovery_email' }
		);
	} );

	test( 'the hook is true only when the account email is bouncing', async () => {
		mockUserSettings( { user_email_bouncing: true } );

		render( <HookProbe /> );

		expect( await screen.findByText( 'should show' ) ).toBeVisible();
	} );

	test( 'the hook is false when the field is false', async () => {
		mockUserSettings( { user_email_bouncing: false } );

		render( <HookProbe /> );

		expect( await screen.findByText( 'should not show' ) ).toBeVisible();
	} );

	test( 'the hook is false when the field is absent, as it is before wpcom deploys', async () => {
		mockUserSettings( {} );

		render( <HookProbe /> );

		expect( await screen.findByText( 'should not show' ) ).toBeVisible();
	} );
} );

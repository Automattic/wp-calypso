/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import RecoveryNudgeNotice from '../recovery-nudge-notice';

function setUrl( search: string ) {
	window.history.replaceState( null, '', `/me/security${ search }` );
}

describe( '<RecoveryNudgeNotice>', () => {
	beforeEach( () => {
		setUrl( '' );
	} );

	test( 'shows the notice, records an impression, and strips the verified param when verified=1', async () => {
		setUrl( '?verified=1&tab=1' );

		const { recordTracksEvent } = render( <RecoveryNudgeNotice /> );

		expect( screen.getByText( /Set up at least one recovery option/ ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '?tab=1' ) );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_security_recovery_notice_impression'
		);
		expect( screen.getByText( /Set up at least one recovery option/ ) ).toBeVisible();
	} );

	test( 'leaves a verified param that is not 1', async () => {
		setUrl( '?verified=0' );

		const { recordTracksEvent, router } = render( <RecoveryNudgeNotice /> );

		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );
		await act( () => Promise.resolve() );
		expect( screen.queryByText( /Set up at least one recovery option/ ) ).not.toBeInTheDocument();
		expect( window.location.search ).toBe( '?verified=0' );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'renders nothing and records no impression without the verified param', () => {
		const { recordTracksEvent } = render( <RecoveryNudgeNotice /> );

		expect( screen.queryByText( /Set up at least one recovery option/ ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'records a dismiss event and hides the notice when closed', async () => {
		setUrl( '?verified=1' );
		const user = userEvent.setup();

		const { recordTracksEvent } = render( <RecoveryNudgeNotice /> );

		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.queryByText( /Set up at least one recovery option/ ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_security_recovery_notice_dismiss'
		);
	} );

	test( 'shows the dismissed notice again when a later link brings the param', async () => {
		setUrl( '?verified=1' );
		const user = userEvent.setup();

		const { recordTracksEvent, router } = render( <RecoveryNudgeNotice /> );

		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );
		act( () => router.history.push( '/me/security?verified=1' ) );

		expect( await screen.findByText( /Set up at least one recovery option/ ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 3 );
		expect( recordTracksEvent ).toHaveBeenLastCalledWith(
			'calypso_dashboard_security_recovery_notice_impression'
		);
	} );

	test( 'records a click event when the recovery CTA is followed', async () => {
		setUrl( '?verified=1' );
		const user = userEvent.setup();

		const { recordTracksEvent } = render( <RecoveryNudgeNotice /> );

		await user.click( screen.getByRole( 'link', { name: 'Set up account recovery' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_security_recovery_notice_click'
		);
	} );
} );

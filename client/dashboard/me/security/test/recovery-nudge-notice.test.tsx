/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import RecoveryNudgeNotice from '../recovery-nudge-notice';

function setUrl( search: string ) {
	window.history.replaceState( {}, '', `/me/security${ search }` );
}

describe( '<RecoveryNudgeNotice>', () => {
	beforeEach( () => {
		setUrl( '' );
	} );

	test( 'shows the notice, records an impression, and strips the verified param when verified=1', () => {
		setUrl( '?verified=1' );

		const { recordTracksEvent } = render( <RecoveryNudgeNotice /> );

		expect( screen.getByText( /Set up at least one recovery option/ ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_security_recovery_notice_impression'
		);
		expect( window.location.search ).toBe( '' );
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

/**
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://my.localhost/" }
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ResurrectedWelcomeModalGate } from '..';
import { render } from '../../../test-utils';
import { useResurrectedFreeUserEligibility } from '../use-resurrected-free-user-eligibility';

jest.mock( '../use-resurrected-free-user-eligibility' );

const mockUseEligibility = jest.mocked( useResurrectedFreeUserEligibility );
const eligibleUser = {
	isLoading: false,
	isResurrectedSixMonths: true,
	hasActivePaidSubscription: false,
	isEligible: true,
	variationName: 'treatment_content',
	isForcedVariation: false,
};

describe( 'ResurrectedWelcomeModalGate', () => {
	beforeEach( () => {
		window.sessionStorage.clear();
		mockUseEligibility.mockReturnValue( eligibleUser );
	} );

	test( 'shows the shared content modal with the latest draft', async () => {
		const draftRequest = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/posts' )
			.query( true )
			.reply( 200, {
				posts: [
					{
						ID: 45,
						site_ID: 67,
						title: '<strong>My &amp; Draft</strong>',
					},
				],
			} );
		const onEligibilityResolved = jest.fn();
		const { recordTracksEvent } = render(
			<ResurrectedWelcomeModalGate onEligibilityResolved={ onEligibilityResolved } />
		);

		const draftCta = await screen.findByRole( 'link', {
			name: 'Finish Draft: "My & Draft"',
		} );

		expect( draftCta.getAttribute( 'href' ) ).toContain( '/post/67/45' );
		expect( draftRequest.isDone() ).toBe( true );
		expect( onEligibilityResolved ).toHaveBeenCalledWith( true );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_resurrected_welcome_modal_impression',
			{ variation: 'treatment_content' }
		);
	} );

	test( 'allows lower-priority modals when the user is ineligible', async () => {
		mockUseEligibility.mockReturnValue( {
			...eligibleUser,
			isEligible: false,
			variationName: 'treatment_manual_dual',
		} );
		const onEligibilityResolved = jest.fn();

		render( <ResurrectedWelcomeModalGate onEligibilityResolved={ onEligibilityResolved } /> );

		await waitFor( () => expect( onEligibilityResolved ).toHaveBeenCalledWith( false ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'allows lower-priority modals when dismissed earlier in the session', async () => {
		window.sessionStorage.setItem( 'wpcom_resurrected_welcome_modal_dismissed', 'true' );
		const onEligibilityResolved = jest.fn();

		render( <ResurrectedWelcomeModalGate onEligibilityResolved={ onEligibilityResolved } /> );

		await waitFor( () => expect( onEligibilityResolved ).toHaveBeenCalledWith( false ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'persists and tracks a close', async () => {
		mockUseEligibility.mockReturnValue( {
			...eligibleUser,
			variationName: 'treatment_manual_dual',
		} );
		const user = userEvent.setup();
		const { recordTracksEvent } = render( <ResurrectedWelcomeModalGate /> );

		await user.click( screen.getByRole( 'button', { name: 'Close welcome back modal' } ) );

		expect( window.sessionStorage.getItem( 'wpcom_resurrected_welcome_modal_dismissed' ) ).toBe(
			'true'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_resurrected_welcome_modal_dismiss', {
			variation: 'treatment_manual_dual',
			source: 'close',
		} );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );

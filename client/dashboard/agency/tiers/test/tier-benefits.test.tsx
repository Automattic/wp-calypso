/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import TierBenefits from '../tier-benefits';

function essentialBenefits() {
	return screen
		.getByRole( 'heading', { name: 'Your essential benefits' } )
		.closest( '.components-card' ) as HTMLElement;
}

describe( '<TierBenefits>', () => {
	test( 'links each action to the href its host passes and skips actions without one', () => {
		render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				links={ {
					'manage-sites': '/sites',
					'manage-purchases': '/marketplace/purchases',
					'create-client-reports': 'https://agencies.automattic.com/reports',
					'contact-support': '#contact-support',
				} }
			/>
		);

		const card = within( essentialBenefits() );
		expect( card.getByRole( 'link', { name: 'Manage sites' } ) ).toHaveAttribute(
			'href',
			'/sites'
		);
		expect( card.getByRole( 'link', { name: 'Manage purchase' } ) ).toHaveAttribute(
			'href',
			'/marketplace/purchases'
		);
		expect( card.getByRole( 'link', { name: 'Create Client Reports' } ) ).toHaveAttribute(
			'href',
			'https://agencies.automattic.com/reports'
		);
		expect( card.getByRole( 'link', { name: 'Contact support' } ) ).toHaveAttribute(
			'href',
			'#contact-support'
		);
		expect(
			card.queryByRole( 'link', { name: 'Make a client referral' } )
		).not.toBeInTheDocument();
	} );

	test( 'records the action click with the tier and action id', async () => {
		const recordTracksEvent = jest.fn();
		render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				recordTracksEvent={ recordTracksEvent }
				links={ { 'manage-sites': '/sites' } }
			/>
		);

		await userEvent.click( screen.getByRole( 'link', { name: 'Manage sites' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_agency_tier_benefits_action_click',
			{ agency_tier: 'emerging-partner', action_id: 'manage-sites' }
		);
	} );

	test( 'renders the download badges action through the host callback', () => {
		render(
			<TierBenefits
				currentAgencyTierId="agency-partner"
				onScheduleCall={ jest.fn() }
				links={ { 'manage-profile': '/agency/partner-directory' } }
				renderDownloadBadges={ ( buttonProps ) => (
					<button { ...( buttonProps as object ) }>Badges here</button>
				) }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Badges here' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Manage your profile' } ) ).toHaveAttribute(
			'href',
			'/agency/partner-directory'
		);
	} );

	test( 'hides the download badges action when the host does not render it', () => {
		render(
			<TierBenefits
				currentAgencyTierId="agency-partner"
				onScheduleCall={ jest.fn() }
				links={ { 'manage-profile': '/agency/partner-directory' } }
			/>
		);

		expect( screen.queryByText( 'Download your badges' ) ).not.toBeInTheDocument();
	} );
} );

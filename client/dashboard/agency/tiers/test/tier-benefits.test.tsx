/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import TierBenefits, { getProspectReportsUsageText } from '../tier-benefits';

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
					'manage-purchases': '/purchases',
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
			'/purchases'
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

	test( 'opens contact support through the host callback instead of the link', async () => {
		const recordTracksEvent = jest.fn();
		const onContactSupport = jest.fn();
		render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				onContactSupport={ onContactSupport }
				recordTracksEvent={ recordTracksEvent }
				links={ { 'contact-support': '#contact-support' } }
			/>
		);

		const card = within( essentialBenefits() );
		expect( card.queryByRole( 'link', { name: 'Contact support' } ) ).not.toBeInTheDocument();

		await userEvent.click( card.getByRole( 'button', { name: 'Contact support' } ) );

		expect( onContactSupport ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_agency_tier_benefits_action_click',
			{ agency_tier: 'emerging-partner', action_id: 'contact-support' }
		);
	} );

	test( 'renders the download badges action through the host callback', () => {
		render(
			<TierBenefits
				currentAgencyTierId="agency-partner"
				onScheduleCall={ jest.fn() }
				links={ { 'manage-profile': '/partner-directory' } }
				renderDownloadBadges={ ( buttonProps ) => (
					<button { ...( buttonProps as object ) }>Badges here</button>
				) }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Badges here' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Manage your profile' } ) ).toHaveAttribute(
			'href',
			'/partner-directory'
		);
	} );

	test( 'hides the download badges action when the host does not render it', () => {
		render(
			<TierBenefits
				currentAgencyTierId="agency-partner"
				onScheduleCall={ jest.fn() }
				links={ { 'manage-profile': '/partner-directory' } }
			/>
		);

		expect( screen.queryByText( 'Download your badges' ) ).not.toBeInTheDocument();
	} );

	test( 'renders plain links for hosts without the dashboard router', async () => {
		const recordTracksEvent = jest.fn();
		render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				recordTracksEvent={ recordTracksEvent }
				links={ { 'manage-sites': '/sites' } }
				shouldUseRouterLink={ false }
			/>
		);

		const link = screen.getByRole( 'link', { name: 'Manage sites' } );
		expect( link ).toHaveAttribute( 'href', '/sites' );

		link.addEventListener( 'click', ( event ) => event.preventDefault() );
		await userEvent.click( link );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_agency_tier_benefits_action_click',
			{ agency_tier: 'emerging-partner', action_id: 'manage-sites' }
		);
	} );

	test( 'shows Prospect Reports only when the host passes its link', () => {
		const { unmount } = render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				links={ { 'manage-sites': '/sites' } }
			/>
		);
		expect( screen.queryByText( 'Prospect Reports' ) ).not.toBeInTheDocument();
		unmount();

		render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				links={ { 'generate-prospect-report': '/prospect-reports?new-report=1' } }
				shouldUseRouterLink={ false }
			/>
		);
		const card = within( essentialBenefits() );
		expect( card.getByText( 'Prospect Reports' ) ).toBeVisible();
		expect( card.getByRole( 'link', { name: 'Generate a report' } ) ).toHaveAttribute(
			'href',
			'/prospect-reports?new-report=1'
		);
	} );

	test( 'shows Prospect Reports usage and only links View reports when the host passes it', () => {
		render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				links={ {
					'generate-prospect-report': '/prospect-reports?new-report=1',
					'view-prospect-reports': '/prospect-reports',
				} }
				shouldUseRouterLink={ false }
				prospectReports={ {
					usage: { used: 3, limit: 5, resets_at: '2026-12-01T00:00:00Z' },
				} }
			/>
		);
		const card = within( essentialBenefits() );
		expect( card.getByText( '3 of 5 reports used this month' ) ).toBeVisible();
		expect( card.getByRole( 'link', { name: 'View reports' } ) ).toHaveAttribute(
			'href',
			'/prospect-reports'
		);
	} );

	test( 'disables Generate a report once the agency hits its monthly cap', () => {
		render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				links={ {
					'generate-prospect-report': '/prospect-reports?new-report=1',
					'view-prospect-reports': '/prospect-reports',
				} }
				shouldUseRouterLink={ false }
				prospectReports={ {
					usage: { used: 5, limit: 5, resets_at: '2026-12-01T00:00:00Z' },
				} }
			/>
		);
		const card = within( essentialBenefits() );
		expect( card.queryByRole( 'link', { name: 'Generate a report' } ) ).not.toBeInTheDocument();
		expect( card.getByRole( 'button', { name: 'Generate a report' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( card.getByRole( 'link', { name: 'View reports' } ) ).toBeVisible();
	} );

	test( 'shows bigger report allowances on higher tiers only when the agency has access', () => {
		const { unmount } = render(
			<TierBenefits currentAgencyTierId="emerging-partner" onScheduleCall={ jest.fn() } />
		);
		expect( screen.queryByText( '15 Prospect Reports a month' ) ).not.toBeInTheDocument();
		unmount();

		render(
			<TierBenefits
				currentAgencyTierId="emerging-partner"
				onScheduleCall={ jest.fn() }
				links={ { 'generate-prospect-report': '/prospect-reports?new-report=1' } }
				shouldUseRouterLink={ false }
			/>
		);
		expect( screen.getByText( '15 Prospect Reports a month' ) ).toBeVisible();
		expect( screen.getByText( '30 Prospect Reports a month' ) ).toBeVisible();
		expect( screen.getByText( '60 Prospect Reports a month' ) ).toBeVisible();
	} );

	test( 'hides report allowances on the agency’s own and lower tiers', () => {
		render(
			<TierBenefits
				currentAgencyTierId="pro-agency-partner"
				onScheduleCall={ jest.fn() }
				links={ { 'generate-prospect-report': '/prospect-reports?new-report=1' } }
				shouldUseRouterLink={ false }
			/>
		);
		expect( screen.queryByText( '15 Prospect Reports a month' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( '30 Prospect Reports a month' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '60 Prospect Reports a month' ) ).toBeVisible();
	} );
} );

describe( 'getProspectReportsUsageText', () => {
	const resets_at = '2026-12-01T00:00:00Z';

	test( 'falls back to the tier allowance while usage loads', () => {
		expect( getProspectReportsUsageText( {}, 'agency-partner' ) ).toBe( '15 reports a month' );
	} );

	test( 'shows the allowance before any reports are used', () => {
		expect(
			getProspectReportsUsageText( { usage: { used: 0, limit: 5, resets_at } }, 'emerging-partner' )
		).toBe( '5 reports a month' );
	} );

	test( 'handles unlimited and pending accounts', () => {
		expect( getProspectReportsUsageText( { usage: { used: 2, limit: null, resets_at } } ) ).toBe(
			'Unlimited reports every month'
		);
		expect( getProspectReportsUsageText( { usage: { used: 0, limit: 0, resets_at } } ) ).toBeNull();
	} );
} );

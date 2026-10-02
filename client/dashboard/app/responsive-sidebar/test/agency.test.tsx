/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import AgencySidebar from '../agency';
import type { AgencySupports } from '../../context';

const agencySupports: AgencySupports = {
	overview: true,
	tiers: true,
	partnerDirectory: true,
	marketplace: true,
	exclusiveOffers: true,
	learn: true,
	mcp: true,
	amplify: true,
	devTools: true,
	sites: true,
	plugins: true,
	team: true,
	earn: true,
	billing: true,
};

// The default test config has `supports.agency: false`, which short-circuits
// the sidebar. Nesting a provider overrides it for this component only.
const config = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, agency: agencySupports },
};

function mockAgency( capabilities: string[], amplifyAllowed = true ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/wpcom/v2/agency' )
		.reply( 200, [
			{
				id: 1,
				partner_directory: { allowed: true, directories: [] },
				amplify: { allowed: amplifyAllowed },
				user: { capabilities },
			},
		] );
}

async function renderSidebar( capabilities: string[], amplifyAllowed = true ) {
	mockAgency( capabilities, amplifyAllowed );
	render(
		<AppProvider config={ config }>
			<AgencySidebar />
		</AppProvider>
	);
	// `Home` is unrestricted, so it marks the point where the suspended
	// agency queries have resolved and the menu has settled.
	await screen.findByRole( 'link', { name: 'Home' } );
}

describe( '<AgencySidebar>', () => {
	test( 'shows every group when the user holds every capability', async () => {
		await renderSidebar( [
			'a4a_read_managed_sites',
			'a4a_read_users',
			'a4a_read_agency_tier',
			'a4a_read_partner_directory',
			'a4a_read_marketplace',
			'a4a_read_exclusive_offers',
			'a4a_jetpack_licensing',
			'a4a_read_learn',
			'a4a_read_referrals',
			'a4a_read_migrations',
			'a4a_read_amplify',
		] );

		expect( screen.getByRole( 'button', { name: 'Clients' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Marketplace' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Grow' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Earn' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Agency' } ) ).toBeVisible();
		for ( const name of [ 'Hosting', 'Products', 'Purchases', 'Exclusive offers' ] ) {
			expect( screen.getByRole( 'link', { name } ) ).toBeVisible();
		}
	} );

	test( 'links every screen at its flat path', async () => {
		await renderSidebar( [
			'a4a_read_managed_sites',
			'a4a_read_users',
			'a4a_read_agency_tier',
			'a4a_read_partner_directory',
			'a4a_read_marketplace',
			'a4a_read_exclusive_offers',
			'a4a_jetpack_licensing',
			'a4a_read_learn',
			'a4a_read_referrals',
			'a4a_read_migrations',
		] );

		const expected: Record< string, string > = {
			Sites: '/sites',
			'Dev tools': '/dev-tools',
			Migrations: '/migrations',
			Library: '/library',
			'Partner Directories': '/partner-directory',
			'Agency tier': '/tiers',
			Referrals: '/referrals',
			WooPayments: '/woopayments',
			'Payout settings': '/payout-settings',
			Team: '/agency/team',
			'AI and MCP': '/agency/ai',
		};
		for ( const [ name, href ] of Object.entries( expected ) ) {
			expect( screen.getByRole( 'link', { name } ) ).toHaveAttribute( 'href', href );
		}
	} );

	test( 'opens Plugins and Billing outside the dashboard', async () => {
		await renderSidebar( [ 'a4a_read_managed_sites', 'a4a_jetpack_licensing' ] );

		expect( screen.getByRole( 'link', { name: /^Plugins/ } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/plugins$/ )
		);
		expect( screen.getByRole( 'link', { name: /^Billing/ } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/me\/billing$/ )
		);
	} );

	test( 'hides menu items the user lacks the capability for', async () => {
		await renderSidebar( [ 'a4a_read_managed_sites' ] );

		expect( screen.getByRole( 'button', { name: 'Clients' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /^Plugins/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Team' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: /^Billing/ } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Marketplace' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Grow' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Earn' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Agency' } ) ).not.toBeInTheDocument();
	} );

	test( 'leaves only Home when the user holds no capabilities', async () => {
		await renderSidebar( [] );

		expect( screen.getByRole( 'link', { name: 'Home' } ) ).toBeVisible();
		expect( screen.getAllByRole( 'link' ) ).toHaveLength( 1 );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the Earn menu but drops the sub-items the user cannot reach', async () => {
		await renderSidebar( [ 'a4a_read_migrations' ] );

		expect( screen.getByRole( 'button', { name: 'Earn' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Payout settings' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Referrals' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'WooPayments' } ) ).not.toBeInTheDocument();
	} );

	test( 'lists Migrations under Clients', async () => {
		await renderSidebar( [ 'a4a_read_migrations' ] );

		expect( screen.getByRole( 'button', { name: 'Clients' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Migrations' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Sites' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the Marketplace menu but drops the sub-items the user cannot reach', async () => {
		await renderSidebar( [ 'a4a_read_marketplace' ] );

		expect( screen.getByRole( 'button', { name: 'Marketplace' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Hosting' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Products' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Exclusive offers' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Purchases' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows only Purchases under Marketplace for a licensing-only user', async () => {
		await renderSidebar( [ 'a4a_jetpack_licensing' ] );

		expect( screen.getByRole( 'button', { name: 'Marketplace' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Purchases' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Hosting' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Products' } ) ).not.toBeInTheDocument();
	} );

	// Partner Directory is gated by both an agency flag
	// (`partner_directory.allowed`) and a capability. `mockAgency` always
	// reports the flag on, so these cases isolate the capability gate.
	test( 'shows Partner Directories under Grow when the user holds the capability', async () => {
		await renderSidebar( [ 'a4a_read_partner_directory' ] );

		expect( screen.getByRole( 'button', { name: 'Grow' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Partner Directories' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Agency tier' } ) ).not.toBeInTheDocument();
	} );

	test( 'hides Partner Directories when the user lacks the capability', async () => {
		await renderSidebar( [ 'a4a_read_agency_tier' ] );

		expect( screen.getByRole( 'link', { name: 'Agency tier' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Partner Directories' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows Library, Dev tools and AI and MCP when the user holds the learn capability', async () => {
		await renderSidebar( [ 'a4a_read_learn' ] );

		expect( screen.getByRole( 'link', { name: 'Library' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Dev tools' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'AI and MCP' } ) ).toBeVisible();
	} );

	test( 'hides Library, Dev tools and AI and MCP when the user lacks the learn capability', async () => {
		await renderSidebar( [ 'a4a_read_managed_sites' ] );

		expect( screen.queryByRole( 'link', { name: 'Library' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Dev tools' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'AI and MCP' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows Amplify under Clients as an internal link when the agency and the user have access', async () => {
		await renderSidebar( [ 'a4a_read_amplify' ] );

		expect( screen.getByRole( 'button', { name: 'Clients' } ) ).toBeVisible();
		const amplify = screen.getByRole( 'link', { name: /Amplify/ } );
		expect( amplify ).toBeVisible();
		expect( amplify ).toHaveAttribute( 'href', expect.stringMatching( /\/amplify$/ ) );
		expect( amplify ).not.toHaveAttribute( 'target', '_blank' );
	} );

	test( 'hides Amplify when the user lacks the amplify capability', async () => {
		await renderSidebar( [ 'a4a_read_managed_sites' ] );

		expect( screen.queryByRole( 'link', { name: /Amplify/ } ) ).not.toBeInTheDocument();
	} );

	test( 'hides Amplify when the agency is not allowed to use it', async () => {
		await renderSidebar( [ 'a4a_read_amplify' ], false );

		expect( screen.queryByRole( 'link', { name: /Amplify/ } ) ).not.toBeInTheDocument();
	} );
} );

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
	exclusiveOffers: true,
	learn: true,
	mcp: true,
	sites: true,
	team: true,
	earn: true,
};

// The default test config has `supports.agency: false`, which short-circuits
// the sidebar. Nesting a provider overrides it for this component only.
const config = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, agency: agencySupports },
};

function mockAgency( capabilities: string[] ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 1, mcp: { allowed: true }, user: { capabilities } } ] );
}

async function renderSidebar( capabilities: string[] ) {
	mockAgency( capabilities );
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
	test( 'shows every menu item when the user holds every capability', async () => {
		await renderSidebar( [
			'a4a_read_managed_sites',
			'a4a_read_users',
			'a4a_read_agency_tier',
			'a4a_read_exclusive_offers',
			'a4a_read_learn',
			'a4a_read_referrals',
			'a4a_read_migrations',
		] );

		expect( screen.getByRole( 'link', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Team' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Agency' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Marketplace' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Resources' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Earn' } ) ).toBeVisible();
	} );

	test( 'hides menu items the user lacks the capability for', async () => {
		await renderSidebar( [ 'a4a_read_managed_sites' ] );

		expect( screen.getByRole( 'link', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Team' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Agency' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Marketplace' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Resources' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Earn' } ) ).not.toBeInTheDocument();
	} );

	test( 'leaves only Home when the user holds no capabilities', async () => {
		await renderSidebar( [] );

		expect( screen.getByRole( 'link', { name: 'Home' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Sites' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the Earn menu but drops the sub-items the user cannot reach', async () => {
		await renderSidebar( [ 'a4a_read_migrations' ] );

		expect( screen.getByRole( 'button', { name: 'Earn' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Overview' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Migrations' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Payout settings' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Referrals' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'WooPayments' } ) ).not.toBeInTheDocument();
	} );

	// MCP is the one item gated by both a tier flag (`mcp.allowed`) and a
	// capability (`a4a_read_learn`). `mockAgency` always reports the tier flag
	// on, so these cases isolate the capability gate.
	test( 'shows MCP when the agency is MCP-enabled and the user holds the learn capability', async () => {
		await renderSidebar( [ 'a4a_read_learn' ] );

		expect( screen.getByRole( 'link', { name: 'MCP' } ) ).toBeVisible();
	} );

	test( 'hides MCP when the agency is MCP-enabled but the user lacks the learn capability', async () => {
		await renderSidebar( [ 'a4a_read_managed_sites' ] );

		expect( screen.queryByRole( 'link', { name: 'MCP' } ) ).not.toBeInTheDocument();
	} );
} );

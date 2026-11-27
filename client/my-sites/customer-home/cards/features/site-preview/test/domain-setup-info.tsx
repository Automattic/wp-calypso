/**
 * @vitest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DomainSetupInfo from '../domain-setup-info';
import type { DomainSummary } from '@automattic/api-core';

const SITE_ID = 123;
const SITE_DOMAIN = 'example.wordpress.com';
const SITE_SLUG = 'example-slug.wordpress.com';

let mockDomains: DomainSummary[] = [];

vi.mock( '@automattic/api-queries', () => ( {
	domainsQuery: () => ( {
		queryKey: [ 'domains' ],
		queryFn: async () => mockDomains,
	} ),
} ) );

function buildDomain( domain: Partial< DomainSummary > = {} ): DomainSummary {
	return {
		domain: 'example.com',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
		blog_id: SITE_ID,
		primary_domain: true,
		domain_status: { id: DomainStatus.ACTIVE, label: 'Active', type: 'success' },
		...domain,
	} as DomainSummary;
}

const defaultAddress = buildDomain( {
	domain: SITE_DOMAIN,
	subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: 'Default address' },
	primary_domain: false,
} );

function renderDomainSetupInfo( siteDomain = SITE_DOMAIN ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	render(
		<QueryClientProvider client={ queryClient }>
			<DomainSetupInfo siteId={ SITE_ID } siteSlug={ SITE_SLUG } siteDomain={ siteDomain } />
		</QueryClientProvider>
	);
	return queryClient;
}

async function waitForDomains( queryClient: QueryClient ) {
	await waitFor( () =>
		expect( queryClient.getQueryState( [ 'domains' ] )?.status ).toBe( 'success' )
	);
}

function queryIcon() {
	return screen.queryByRole( 'button', { name: 'Domain setup status' } );
}

async function openPopover() {
	await userEvent.click( await screen.findByRole( 'button', { name: 'Domain setup status' } ) );
}

describe( 'DomainSetupInfo', () => {
	it( 'does not show the info icon when the primary domain is active', async () => {
		mockDomains = [
			defaultAddress,
			buildDomain( {
				domain: 'example.net',
				primary_domain: false,
				domain_status: { id: DomainStatus.IN_PROGRESS, label: 'In progress', type: 'warning' },
			} ),
			buildDomain(),
		];
		await waitForDomains( renderDomainSetupInfo() );

		expect( queryIcon() ).not.toBeInTheDocument();
	} );

	it.each( [ 'example.com', 'www.example.com' ] )(
		'does not show the info icon when the site already serves from the custom domain as %s',
		async ( siteDomain ) => {
			mockDomains = [
				defaultAddress,
				buildDomain( {
					domain_status: { id: DomainStatus.IN_PROGRESS, label: 'In progress', type: 'warning' },
					set_primary_domain_pending: true,
				} ),
			];
			await waitForDomains( renderDomainSetupInfo( siteDomain ) );

			expect( queryIcon() ).not.toBeInTheDocument();
		}
	);

	it( 'does not show the info icon for a site redirect', async () => {
		mockDomains = [
			defaultAddress,
			buildDomain( {
				subtype: { id: DomainSubtype.SITE_REDIRECT, label: 'Site redirect' },
				primary_domain: false,
				domain_status: { id: DomainStatus.IN_PROGRESS, label: 'In progress', type: 'warning' },
			} ),
		];
		await waitForDomains( renderDomainSetupInfo() );

		expect( queryIcon() ).not.toBeInTheDocument();
	} );

	it.each( [
		[
			'has a failed transfer',
			{
				domain_status: {
					id: DomainStatus.TRANSFER_ERROR,
					label: 'Transfer error',
					type: 'error',
				},
			},
		],
		[ 'is active but still being made the primary address', { set_primary_domain_pending: true } ],
	] as [ string, Partial< DomainSummary > ][] )(
		'shows the info icon when the primary domain %s',
		async ( _, overrides ) => {
			mockDomains = [ defaultAddress, buildDomain( overrides ) ];
			renderDomainSetupInfo();

			expect( await screen.findByRole( 'button', { name: 'Domain setup status' } ) ).toBeVisible();
		}
	);

	it.each( [ DomainStatus.EXPIRED, DomainStatus.EXPIRING_SOON ] )(
		'does not show the info icon for a non-primary domain that is %s',
		async ( status ) => {
			mockDomains = [
				defaultAddress,
				buildDomain( {
					primary_domain: false,
					domain_status: { id: status, label: status, type: 'warning' },
				} ),
			];
			await waitForDomains( renderDomainSetupInfo() );

			expect( queryIcon() ).not.toBeInTheDocument();
		}
	);

	it( 'does not show the info icon for a domain that belongs to another site', async () => {
		mockDomains = [
			defaultAddress,
			buildDomain( {
				blog_id: SITE_ID + 1,
				domain_status: { id: DomainStatus.IN_PROGRESS, label: 'In progress', type: 'warning' },
			} ),
		];
		await waitForDomains( renderDomainSetupInfo() );

		expect( queryIcon() ).not.toBeInTheDocument();
	} );

	it( 'links to the first custom domain being set up when no custom domain is primary', async () => {
		mockDomains = [
			defaultAddress,
			buildDomain( { domain: 'old.com', primary_domain: false } ),
			buildDomain( {
				domain: 'new.com',
				primary_domain: false,
				domain_status: { id: DomainStatus.IN_PROGRESS, label: 'In progress', type: 'warning' },
			} ),
		];
		renderDomainSetupInfo();
		await openPopover();

		const link = screen.getByRole( 'link', { name: 'View domain status' } );

		expect( link ).toHaveAttribute(
			'href',
			'/domains/manage/new.com/edit/example-slug.wordpress.com'
		);
	} );

	it( 'shows the explanation when the icon is clicked', async () => {
		mockDomains = [
			defaultAddress,
			buildDomain( {
				domain_status: { id: DomainStatus.IN_PROGRESS, label: 'In progress', type: 'warning' },
			} ),
		];
		renderDomainSetupInfo();
		const explanation = `Your domain example.com is still being set up. In the meantime, your site is reachable at ${ SITE_DOMAIN }.`;

		expect( await screen.findByRole( 'button', { name: 'Domain setup status' } ) ).toBeVisible();
		expect( screen.queryByText( /^Your domain/ ) ).not.toBeInTheDocument();

		await openPopover();

		const text = screen.getByText( /^Your domain/ );
		expect( text ).toBeVisible();
		expect( text ).toHaveTextContent( explanation );
	} );
} );

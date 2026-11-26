/**
 * @vitest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { getDashboardFromQuery } from 'calypso/dashboard/app/routing';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import {
	createSiteFromDomainOnly,
	domainManagementTransferToOtherSite,
	domainAddEmailUpsell,
	domainManagementList,
} from 'calypso/my-sites/domains/paths';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { canAnySiteConnectDomains } from 'calypso/state/selectors/can-any-site-connect-domains';
import isCurrentPlanPaid from 'calypso/state/sites/selectors/is-current-plan-paid';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DomainOnly from '../index';
import type { ReceiptPurchase } from 'calypso/my-sites/checkout/checkout-thank-you/receipt';

vi.mock( '@automattic/calypso-analytics' );

const mockQuerySites = vi.fn();

vi.mock( 'calypso/components/data/query-sites', () => ( {
	default: ( props: { siteId: number } ) => {
		mockQuerySites( props );
		return null;
	},
} ) );

vi.mock( 'calypso/state/dashboard/selectors', () => ( {
	hasDashboardOptIn: vi.fn(),
} ) );

vi.mock( 'calypso/state/selectors/can-any-site-connect-domains', () => ( {
	canAnySiteConnectDomains: vi.fn(),
} ) );

vi.mock( 'calypso/state/sites/selectors/is-current-plan-paid', () => ( {
	__esModule: true,
	default: vi.fn(),
} ) );

vi.mock(
	'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable',
	() => ( {
		useDomainToPlanCreditsApplicable: vi.fn(),
	} )
);

vi.mock( 'calypso/dashboard/app/routing', async () => ( {
	...( await vi.importActual< typeof import( 'calypso/dashboard/app/routing' ) >(
		'calypso/dashboard/app/routing'
	) ),
	getDashboardFromQuery: vi.fn(),
} ) );

const mockDomainPurchase: ReceiptPurchase = {
	meta: 'example.com',
	blogId: 123,
	delayedProvisioning: false,
	isDomainRegistration: true,
	productId: 'domain_registration',
	productSlug: 'dotcom_domain',
	productType: 'domain',
	productName: 'Domain Registration',
	isHundredYearDomain: false,
	saasRedirectUrl: '',
	newQuantity: undefined,
	priceInteger: 1000,
};

function renderComponent( { currency = 'USD' }: { currency?: string } = {} ) {
	return renderWithProvider(
		<DomainOnly domainPurchase={ mockDomainPurchase } currency={ currency } />
	);
}

describe( 'DomainOnly', () => {
	beforeEach( () => {
		// Suppress the console for navigation errors, which are not implemented by JSDom
		const consoleError = console.error;

		vi.spyOn( console, 'error' ).mockImplementation( ( message ) => {
			if ( ! message.toString().includes( 'Not implemented: navigation' ) ) {
				consoleError( message );
			}
		} );

		vi.mocked( hasDashboardOptIn ).mockReturnValue( false );
		vi.mocked( canAnySiteConnectDomains ).mockReturnValue( false );
		vi.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( null );
		vi.mocked( isCurrentPlanPaid ).mockReturnValue( false );
		mockQuerySites.mockClear();
	} );

	afterEach( () => {
		vi.spyOn( console, 'error' ).mockRestore();
	} );

	describe( 'Start a new site', () => {
		it( 'links to the site creation flow', () => {
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Start a new site/ } ) ).toHaveAttribute(
				'href',
				createSiteFromDomainOnly( mockDomainPurchase.meta, mockDomainPurchase.blogId )
			);
		} );

		it( 'is visible when the domain’s site does not have a paid plan', () => {
			vi.mocked( isCurrentPlanPaid ).mockReturnValue( false );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Start a new site/ } ) ).toBeVisible();
		} );

		it( 'is not visible when the domain’s site already has a paid plan', () => {
			vi.mocked( isCurrentPlanPaid ).mockReturnValue( true );
			renderComponent();

			expect( screen.queryByRole( 'link', { name: /Start a new site/ } ) ).not.toBeInTheDocument();
		} );

		it( 'is not visible while the site plan status is loading', () => {
			vi.mocked( isCurrentPlanPaid ).mockReturnValue( null );
			renderComponent();

			expect( screen.queryByRole( 'link', { name: /Start a new site/ } ) ).not.toBeInTheDocument();
		} );

		it( 'queries the sites so the plan status can be resolved', () => {
			renderComponent();

			expect( mockQuerySites ).toHaveBeenCalledWith(
				expect.objectContaining( { siteId: mockDomainPurchase.blogId } )
			);
		} );

		it( 'records a tracks event when the user clicks the "Start a new site" link', async () => {
			const user = userEvent.setup();
			renderComponent();

			await user.click( screen.getByRole( 'link', { name: /Start a new site/ } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_thank_you_domain_next_step_click',
				{
					next_step: 'start_new_site',
					domain_tld: 'com',
				}
			);
		} );
	} );

	describe( 'Plan upgrade credits', () => {
		it( 'renders the upgrade credits benefit when useDomainToPlanCreditsApplicable returns a value', () => {
			vi.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( 1000 );
			renderComponent( { currency: 'USD' } );

			expect(
				screen.getByText( '$10 in upgrade credits will be applied to new paid plan purchases.' )
			).toBeVisible();
		} );

		it( 'renders the upgrade credits benefit when useDomainToPlanCreditsApplicable returns a value in a different currency', () => {
			vi.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( 1000 );
			renderComponent( { currency: 'EUR' } );

			expect(
				screen.getByText( '€10 in upgrade credits will be applied to new paid plan purchases.' )
			).toBeVisible();
		} );

		it( 'does not render upgrade credits when useDomainToPlanCreditsApplicable returns null', () => {
			vi.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( null );
			renderComponent();

			expect(
				screen.queryByText( /in upgrade credits will be applied to new paid plan purchases/ )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'Add a mailbox', () => {
		it( 'links to the Calypso domain email upsell when the user does not have dashboard opt-in', () => {
			vi.mocked( hasDashboardOptIn ).mockReturnValue( false );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Add a mailbox/ } ) ).toHaveAttribute(
				'href',
				domainAddEmailUpsell( mockDomainPurchase.meta, mockDomainPurchase.meta )
			);
		} );

		it( 'links to the dashboard email solution when the user has dashboard opt-in', () => {
			vi.mocked( hasDashboardOptIn ).mockReturnValue( true );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Add a mailbox/ } ) ).toHaveAttribute(
				'href',
				dashboardLink( `/emails/choose-email-solution/${ mockDomainPurchase.meta }` )
			);
		} );

		it( 'renders the top text with the domain name', () => {
			renderComponent();

			expect(
				screen.getByText( `Create a professional email address on ${ mockDomainPurchase.meta }.` )
			).toBeVisible();
		} );

		it( 'records a tracks event when the user clicks the "Add a mailbox" link', async () => {
			const user = userEvent.setup();
			renderComponent();

			await user.click( screen.getByRole( 'link', { name: /Add a mailbox/ } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_thank_you_domain_next_step_click',
				{
					next_step: 'add_mailbox',
					domain_tld: 'com',
				}
			);
		} );
	} );

	describe( 'Attach to an existing site', () => {
		it( 'is not visible when the user has no eligible sites', () => {
			vi.mocked( canAnySiteConnectDomains ).mockReturnValue( false );
			renderComponent();

			expect(
				screen.queryByRole( 'link', { name: /Attach to an existing site/ } )
			).not.toBeInTheDocument();
		} );

		it( 'is visible when the user has eligible sites', () => {
			vi.mocked( canAnySiteConnectDomains ).mockReturnValue( true );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Attach to an existing site/ } ) ).toBeVisible();
		} );

		it( 'links to the Calypso transfer page when the user does not have dashboard opt-in', () => {
			vi.mocked( canAnySiteConnectDomains ).mockReturnValue( true );
			vi.mocked( hasDashboardOptIn ).mockReturnValue( false );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Attach to an existing site/ } ) ).toHaveAttribute(
				'href',
				domainManagementTransferToOtherSite( mockDomainPurchase.meta, mockDomainPurchase.meta )
			);
		} );

		it( 'links to the dashboard transfer page when the user has dashboard opt-in', () => {
			vi.mocked( canAnySiteConnectDomains ).mockReturnValue( true );
			vi.mocked( hasDashboardOptIn ).mockReturnValue( true );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Attach to an existing site/ } ) ).toHaveAttribute(
				'href',
				dashboardLink( `/domains/${ mockDomainPurchase.meta }/transfer/other-site` )
			);
		} );

		it( 'records a tracks event when the user clicks the "Attach to an existing site" link', async () => {
			vi.mocked( canAnySiteConnectDomains ).mockReturnValue( true );

			const user = userEvent.setup();
			renderComponent();

			await user.click( screen.getByRole( 'link', { name: /Attach to an existing site/ } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_thank_you_domain_next_step_click',
				{
					next_step: 'attach_existing_site',
					domain_tld: 'com',
				}
			);
		} );
	} );

	describe( 'Use the domain name only', () => {
		it( 'links to the Calypso domain management list when the user does not have dashboard opt-in', () => {
			vi.mocked( hasDashboardOptIn ).mockReturnValue( false );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Use the domain name only/ } ) ).toHaveAttribute(
				'href',
				domainManagementList( mockDomainPurchase.meta, mockDomainPurchase.meta )
			);
		} );

		it( 'links to the dashboard domain page when the user has dashboard opt-in', () => {
			vi.mocked( hasDashboardOptIn ).mockReturnValue( true );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Use the domain name only/ } ) ).toHaveAttribute(
				'href',
				dashboardLink( `/domains/${ mockDomainPurchase.meta }` )
			);
		} );

		it( 'records a tracks event when the user clicks the "Use the domain name only" link', async () => {
			const user = userEvent.setup();
			renderComponent();

			await user.click( screen.getByRole( 'link', { name: /Use the domain name only/ } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_thank_you_domain_next_step_click',
				{
					next_step: 'use_domain_only',
					domain_tld: 'com',
				}
			);
		} );
	} );

	describe( 'Migrate an existing site', () => {
		it( 'links to the site migration setup flow', () => {
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Migrate an existing site/ } ) ).toHaveAttribute(
				'href',
				`/setup/site-migration?siteSlug=${ mockDomainPurchase.meta }`
			);
		} );

		it( 'links to the site migration setup flow with dashboard query param if present', () => {
			vi.mocked( getDashboardFromQuery ).mockReturnValue( 'a4a' );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Migrate an existing site/ } ) ).toHaveAttribute(
				'href',
				`/setup/site-migration?dashboard=a4a&siteSlug=${ mockDomainPurchase.meta }`
			);
		} );

		it( 'records a tracks event when the user clicks the "Migrate an existing site" link', async () => {
			const user = userEvent.setup();
			renderComponent();

			await user.click( screen.getByRole( 'link', { name: /Migrate an existing site/ } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_thank_you_domain_next_step_click',
				{
					next_step: 'migrate_existing_site',
					domain_tld: 'com',
				}
			);
		} );
	} );
} );

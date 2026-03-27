/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
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
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DomainOnly from '../index';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

jest.mock( '@automattic/calypso-analytics' );

jest.mock( 'calypso/state/dashboard/selectors', () => ( {
	hasDashboardOptIn: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/can-any-site-connect-domains', () => ( {
	canAnySiteConnectDomains: jest.fn(),
} ) );

jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable',
	() => ( {
		useDomainToPlanCreditsApplicable: jest.fn(),
	} )
);

jest.mock( 'calypso/dashboard/app/routing', () => ( {
	...jest.requireActual( 'calypso/dashboard/app/routing' ),
	getDashboardFromQuery: jest.fn(),
} ) );

const mockDomainPurchase: ReceiptPurchase = {
	meta: 'example.com',
	blogId: 123,
	delayedProvisioning: false,
	freeTrial: false,
	isDomainRegistration: true,
	productId: 'domain_registration',
	productSlug: 'dotcom_domain',
	productType: 'domain',
	productName: 'Domain Registration',
	productNameShort: 'Domain',
	registrarSupportUrl: '',
	isEmailVerified: true,
	isRootDomainWithUs: true,
	isHundredYearDomain: false,
	isRenewal: false,
	willAutoRenew: true,
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

		jest.spyOn( console, 'error' ).mockImplementation( ( message ) => {
			if ( ! message.toString().includes( 'Not implemented: navigation' ) ) {
				consoleError( message );
			}
		} );

		jest.mocked( hasDashboardOptIn ).mockReturnValue( false );
		jest.mocked( canAnySiteConnectDomains ).mockReturnValue( false );
		jest.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( null );
	} );

	afterEach( () => {
		jest.spyOn( console, 'error' ).mockRestore();
	} );

	describe( 'Start a new site', () => {
		it( 'links to the site creation flow', () => {
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Start a new site/ } ) ).toHaveAttribute(
				'href',
				createSiteFromDomainOnly( mockDomainPurchase.meta, mockDomainPurchase.blogId )
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
			jest.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( 1000 );
			renderComponent( { currency: 'USD' } );

			expect(
				screen.getByText( '$10 in upgrade credits will be applied to new paid plan purchases.' )
			).toBeVisible();
		} );

		it( 'renders the upgrade credits benefit when useDomainToPlanCreditsApplicable returns a value in a different currency', () => {
			jest.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( 1000 );
			renderComponent( { currency: 'EUR' } );

			expect(
				screen.getByText( '€10 in upgrade credits will be applied to new paid plan purchases.' )
			).toBeVisible();
		} );

		it( 'does not render upgrade credits when useDomainToPlanCreditsApplicable returns null', () => {
			jest.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( null );
			renderComponent();

			expect(
				screen.queryByText( /in upgrade credits will be applied to new paid plan purchases/ )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'Add a mailbox', () => {
		it( 'links to the Calypso domain email upsell when the user does not have dashboard opt-in', () => {
			jest.mocked( hasDashboardOptIn ).mockReturnValue( false );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Add a mailbox/ } ) ).toHaveAttribute(
				'href',
				domainAddEmailUpsell( mockDomainPurchase.meta, mockDomainPurchase.meta )
			);
		} );

		it( 'links to the dashboard email solution when the user has dashboard opt-in', () => {
			jest.mocked( hasDashboardOptIn ).mockReturnValue( true );
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
			jest.mocked( canAnySiteConnectDomains ).mockReturnValue( false );
			renderComponent();

			expect(
				screen.queryByRole( 'link', { name: /Attach to an existing site/ } )
			).not.toBeInTheDocument();
		} );

		it( 'is visible when the user has eligible sites', () => {
			jest.mocked( canAnySiteConnectDomains ).mockReturnValue( true );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Attach to an existing site/ } ) ).toBeVisible();
		} );

		it( 'links to the Calypso transfer page when the user does not have dashboard opt-in', () => {
			jest.mocked( canAnySiteConnectDomains ).mockReturnValue( true );
			jest.mocked( hasDashboardOptIn ).mockReturnValue( false );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Attach to an existing site/ } ) ).toHaveAttribute(
				'href',
				domainManagementTransferToOtherSite( mockDomainPurchase.meta, mockDomainPurchase.meta )
			);
		} );

		it( 'links to the dashboard transfer page when the user has dashboard opt-in', () => {
			jest.mocked( canAnySiteConnectDomains ).mockReturnValue( true );
			jest.mocked( hasDashboardOptIn ).mockReturnValue( true );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Attach to an existing site/ } ) ).toHaveAttribute(
				'href',
				dashboardLink( `/domains/${ mockDomainPurchase.meta }/transfer/other-site` )
			);
		} );

		it( 'records a tracks event when the user clicks the "Attach to an existing site" link', async () => {
			jest.mocked( canAnySiteConnectDomains ).mockReturnValue( true );

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
			jest.mocked( hasDashboardOptIn ).mockReturnValue( false );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Use the domain name only/ } ) ).toHaveAttribute(
				'href',
				domainManagementList( mockDomainPurchase.meta, mockDomainPurchase.meta )
			);
		} );

		it( 'links to the dashboard domain page when the user has dashboard opt-in', () => {
			jest.mocked( hasDashboardOptIn ).mockReturnValue( true );
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
			jest.mocked( getDashboardFromQuery ).mockReturnValue( 'ciab' );
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Migrate an existing site/ } ) ).toHaveAttribute(
				'href',
				`/setup/site-migration?dashboard=ciab&siteSlug=${ mockDomainPurchase.meta }`
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

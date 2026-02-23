/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
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
		jest.mocked( hasDashboardOptIn ).mockReturnValue( false );
		jest.mocked( canAnySiteConnectDomains ).mockReturnValue( false );
		jest.mocked( useDomainToPlanCreditsApplicable ).mockReturnValue( null );
	} );

	describe( 'Start a new site', () => {
		it( 'links to the site creation flow', () => {
			renderComponent();

			expect( screen.getByRole( 'link', { name: /Start a new site/ } ) ).toHaveAttribute(
				'href',
				createSiteFromDomainOnly( mockDomainPurchase.meta, mockDomainPurchase.blogId )
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
	} );
} );

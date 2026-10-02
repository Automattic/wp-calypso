/**
 * @jest-environment jsdom
 */
import { DOMAIN_FLOW, LAUNCH_SITE_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { screen } from '@testing-library/react';
import { useSite } from '../../../../../hooks/use-site';
import { renderStep } from '../../test/helpers';
import DomainSearchStep from '../index';
import type { ReactNode } from 'react';

jest.mock( '../../../../../hooks/use-site', () => ( { useSite: jest.fn() } ) );
jest.mock( 'calypso/state/dashboard/selectors', () => ( { hasDashboardOptIn: () => false } ) );

jest.mock( 'calypso/components/domains/wpcom-domain-search', () => ( {
	WPCOMDomainSearch: ( {
		isFirstDomainFreeForFirstYear,
		slots,
	}: {
		isFirstDomainFreeForFirstYear: boolean;
		slots: { BeforeResults: () => ReactNode; BeforeFullCartItems: () => ReactNode };
	} ) => (
		<div>
			{ isFirstDomainFreeForFirstYear && <span>first year free pricing</span> }
			<slots.BeforeResults />
			<slots.BeforeFullCartItems />
		</div>
	),
} ) );

jest.mock( 'calypso/components/domains/wpcom-domain-search/free-domain-for-a-year-promo', () => ( {
	FreeDomainForAYearPromo: ( { textOnly }: { textOnly?: boolean } ) => (
		<span>{ textOnly ? 'promo text' : 'promo banner' }</span>
	),
} ) );

const site = { ID: 123, slug: 'example.wordpress.com', URL: 'https://example.wordpress.com' };

const renderDomainSearch = (
	flow: string,
	{ query = '', siteCount = 3 }: { query?: string; siteCount?: number } = {}
) =>
	renderStep(
		<DomainSearchStep
			flow={ flow }
			stepName="domains"
			navigation={ { submit: jest.fn(), goBack: jest.fn() } }
		/>,
		{
			initialEntry: `/domains?siteSlug=example.wordpress.com${ query }`,
			initialState: { currentUser: { id: 1, user: { ID: 1, site_count: siteCount } } },
		}
	);

describe( 'DomainSearchStep free domain promo', () => {
	beforeEach( () => {
		jest.mocked( useSite ).mockReturnValue( site as ReturnType< typeof useSite > );
	} );

	it( 'shows the promo for an existing site in the launch-site flow, without first-year-free pricing', () => {
		renderDomainSearch( LAUNCH_SITE_FLOW );

		expect( screen.getByText( 'promo banner' ) ).toBeVisible();
		expect( screen.getByText( 'promo text' ) ).toBeVisible();
		expect( screen.queryByText( 'first year free pricing' ) ).not.toBeInTheDocument();
	} );

	it( 'hides the promo for an existing site in other flows', () => {
		renderDomainSearch( ONBOARDING_FLOW );

		expect( screen.queryByText( 'promo banner' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'promo text' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'DomainSearchStep back button', () => {
	beforeEach( () => {
		jest.mocked( useSite ).mockReturnValue( site as ReturnType< typeof useSite > );
	} );

	it( 'ignores `source` in the launch-site flow and goes back to sites', () => {
		renderDomainSearch( LAUNCH_SITE_FLOW, { query: '&source=my-home' } );

		expect( screen.getByRole( 'link', { name: 'Back to sites' } ) ).toHaveAttribute(
			'href',
			'/sites'
		);
	} );

	it( 'goes back to My Home in the launch-site flow when the user has one site', () => {
		renderDomainSearch( LAUNCH_SITE_FLOW, { query: '&source=site', siteCount: 1 } );

		expect( screen.getByRole( 'link', { name: 'Back to My Home' } ) ).toHaveAttribute(
			'href',
			'/home'
		);
	} );

	it( 'follows a safe back_to in the launch-site flow', () => {
		renderDomainSearch( LAUNCH_SITE_FLOW, {
			query: '&source=my-home&back_to=%2Fhome%2Fexample.wordpress.com',
		} );

		expect( screen.getByRole( 'link', { name: 'Back' } ) ).toHaveAttribute(
			'href',
			'/home/example.wordpress.com'
		);
	} );

	it( 'keeps honoring `source` in other flows', () => {
		renderDomainSearch( DOMAIN_FLOW, { query: '&source=my-home' } );

		expect( screen.getByRole( 'link', { name: 'Back to My Home' } ) ).toHaveAttribute(
			'href',
			'/home/example.wordpress.com'
		);
	} );
} );

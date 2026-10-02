/**
 * @jest-environment jsdom
 */
import { LAUNCH_SITE_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { screen } from '@testing-library/react';
import { useSite } from '../../../../../hooks/use-site';
import { renderStep } from '../../test/helpers';
import DomainSearchStep from '../index';
import type { ReactNode } from 'react';

jest.mock( '../../../../../hooks/use-site', () => ( { useSite: jest.fn() } ) );

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

const renderDomainSearch = ( flow: string ) =>
	renderStep(
		<DomainSearchStep flow={ flow } stepName="domains" navigation={ { submit: jest.fn() } } />,
		{ initialEntry: '/domains?siteSlug=example.wordpress.com' }
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

/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { SitePlan } from '../sites-site-plan';

const siteOwnerId = 1;
const otherAdminId = 2;

const stagingSite = {
	ID: 1,
	site_owner: siteOwnerId,
	title: 'Staging Site',
	is_wpcom_staging_site: true,
};

const activeBusinessSite = {
	ID: 1,
	site_owner: siteOwnerId,
	title: 'Expired Business Site',
	plan: {
		expired: false,
		product_name_short: 'Business',
	},
};

const expiredBusinessSite = {
	ID: 1,
	site_owner: siteOwnerId,
	title: 'Expired Business Site',
	plan: {
		expired: true,
		product_name_short: 'Business',
	},
};

describe( '<SitePlan>', () => {
	beforeEach( () => {
		const mockIntersectionObserver = jest.fn();
		mockIntersectionObserver.mockReturnValue( {
			observe: () => null,
			unobserve: () => null,
			disconnect: () => null,
		} );
		window.IntersectionObserver = mockIntersectionObserver;
	} );

	test( 'shows "Staging" as label for a staging site', () => {
		const { container } = render( <SitePlan site={ stagingSite } userId={ siteOwnerId } /> );
		expect( container.textContent ).toBe( 'Staging' );
	} );

	test( 'shows "Business" as label for a site with an active Business plan', () => {
		const { container } = render(
			<SitePlan site={ activeBusinessSite } userId={ otherAdminId } />
		);
		expect( container.textContent ).toBe( 'Business' );
	} );

	test( 'shows "Business" as label to an administrator for site with an expired Business plan', () => {
		const { getByText, queryAllByRole } = render(
			<SitePlan site={ expiredBusinessSite } userId={ otherAdminId } />
		);
		expect( getByText( 'Business - Expired' ) ).toBeInTheDocument();
		expect( queryAllByRole( 'link' ) ).toHaveLength( 0 );
	} );

	test( 'shows "Business" as label to a site owner for a site with an expired Business plan', () => {
		const { getByText, queryAllByRole, getByRole } = render(
			<SitePlan site={ expiredBusinessSite } userId={ siteOwnerId } />
		);
		expect( getByText( 'Business - Expired' ) ).toBeInTheDocument();
		expect( queryAllByRole( 'link' ) ).toHaveLength( 1 );
		expect( getByRole( 'link', { name: 'Renew plan' } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/checkout\// )
		);
	} );
} );

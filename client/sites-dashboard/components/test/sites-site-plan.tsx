/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { PLAN_HOSTING_TRIAL_MONTHLY } from '@automattic/calypso-products';
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
	title: 'Expired Creator Site',
	plan: {
		expired: false,
		product_name_short: 'Creator',
	},
};

const expiredBusinessSite = {
	ID: 1,
	site_owner: siteOwnerId,
	title: 'Expired Creator Site',
	plan: {
		expired: true,
		product_name_short: 'Creator',
	},
};

const activeTrialSite = {
	ID: 1,
	site_owner: siteOwnerId,
	title: 'Active Creator Trial',
	plan: {
		expired: false,
		product_name_short: 'Creator Trial',
		product_slug: PLAN_HOSTING_TRIAL_MONTHLY,
	},
};

const expiredTrialSite = {
	ID: 1,
	site_owner: siteOwnerId,
	title: 'Expired Creator Trial',
	plan: {
		expired: true,
		product_name_short: 'Creator Trial',
		product_slug: PLAN_HOSTING_TRIAL_MONTHLY,
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

	test( 'shows "Creator" as label for a site with an active Creator plan', () => {
		const { container } = render(
			<SitePlan site={ activeBusinessSite } userId={ otherAdminId } />
		);
		expect( container.textContent ).toBe( 'Creator' );
	} );

	test( 'shows "Creator" as label to an administrator for site with an expired Creator plan', () => {
		const { getByText, queryAllByRole } = render(
			<SitePlan site={ expiredBusinessSite } userId={ otherAdminId } />
		);
		expect( getByText( 'Creator-Expired' ) ).toBeInTheDocument();
		expect( queryAllByRole( 'link' ) ).toHaveLength( 0 );
	} );

	test( 'shows "Creator" as label to a site owner for a site with an expired Creator plan', () => {
		const { getByText, queryAllByRole, getByRole } = render(
			<SitePlan site={ expiredBusinessSite } userId={ siteOwnerId } />
		);
		expect( getByText( 'Creator-Expired' ) ).toBeInTheDocument();
		expect( queryAllByRole( 'link' ) ).toHaveLength( 1 );
		expect( getByRole( 'link', { name: 'Renew plan' } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/checkout\// )
		);
	} );

	test( 'shows "Creator Trial" as label for a site with an active Creator Trial plan', () => {
		const { container, queryAllByRole } = render(
			<SitePlan site={ activeTrialSite } userId={ siteOwnerId } />
		);
		expect( container.textContent ).toBe( 'Creator Trial' );
		expect( queryAllByRole( 'link' ) ).toHaveLength( 0 );
	} );

	test( 'shows "Creator Trial" as label to an administrator for site with an expired Creator Trial plan', () => {
		const { container, queryAllByRole } = render(
			<SitePlan site={ expiredTrialSite } userId={ otherAdminId } />
		);
		expect( container.textContent ).toBe( 'Creator Trial-Expired' );
		expect( queryAllByRole( 'link' ) ).toHaveLength( 0 );
	} );

	test( 'shows "Creator Trial" as label to a site owner for a site with an expired Creator Trial plan', () => {
		const { getByText, queryAllByRole, getByRole } = render(
			<SitePlan site={ expiredTrialSite } userId={ siteOwnerId } />
		);
		expect( getByText( 'Creator Trial-Expired' ) ).toBeInTheDocument();
		expect( queryAllByRole( 'link' ) ).toHaveLength( 1 );
		expect( getByRole( 'link', { name: 'Upgrade' } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/plans\// )
		);
	} );
} );

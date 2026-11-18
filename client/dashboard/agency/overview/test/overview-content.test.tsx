/**
 * @vitest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import AgencyOverviewContent from '../overview-content';
import type { AgencyOverviewContentProps } from '../overview-content';

const API = 'https://public-api.wordpress.com';
const DURING_SALE = '2026-11-25T12:00:00Z';

const links: AgencyOverviewContentProps[ 'links' ] = {
	tiers: '/tiers',
	sites: '/sites',
	referrals: '/referrals',
	woopayments: '/woopayments',
	marketplace: '/marketplace',
	jetpackProducts: '/products?category=jetpack',
	partnerDirectory: '/partner-directory',
	leadMatching: '/partner-directory/lead-matching',
	contactSupport: '/contact',
	helpful: [],
};

function renderOverviewContent( props: Partial< AgencyOverviewContentProps > = {} ) {
	nock( API ).get( /.*/ ).query( true ).reply( 200, [] ).persist();
	return render(
		<AgencyOverviewContent
			agencyId={ 123 }
			influencedRevenue={ 0 }
			approvalStatus="approved"
			billingSystem="billingdragon"
			links={ links }
			shouldUseRouterLink={ false }
			{ ...props }
		/>,
		{ queryClient }
	);
}

const saleBanner = () => screen.queryByText( '25% off new yearly Jetpack licenses' );

beforeEach( () => {
	vi.useFakeTimers( { toFake: [ 'Date' ] } );
	vi.setSystemTime( new Date( DURING_SALE ) );
	queryClient.clear();
	queryClient.setDefaultOptions( { queries: { retry: false } } );
} );

afterEach( () => {
	vi.useRealTimers();
	queryClient.clear();
} );

test( 'shows the Jetpack holiday sale banner during the sale, linked to the Jetpack products', () => {
	renderOverviewContent();
	expect( saleBanner() ).toBeVisible();
	expect( screen.getByRole( 'link', { name: 'View Jetpack products' } ) ).toHaveAttribute(
		'href',
		'/products?category=jetpack'
	);
} );

test.each( [
	[ 'the minute before the sale starts', '2026-11-18T23:59:00Z' ],
	[ 'the moment the sale ends', '2026-12-03T00:00:00Z' ],
] )( 'hides the Jetpack holiday sale banner at %s', ( _description, now ) => {
	vi.setSystemTime( new Date( now ) );
	renderOverviewContent();
	expect( saleBanner() ).not.toBeInTheDocument();
} );

test.each( [
	[ 'the first minute of the sale', '2026-11-19T00:00:00Z' ],
	[ 'the last minute of the sale', '2026-12-02T23:59:00Z' ],
] )( 'shows the Jetpack holiday sale banner at %s', ( _description, now ) => {
	vi.setSystemTime( new Date( now ) );
	renderOverviewContent();
	expect( saleBanner() ).toBeVisible();
} );

test.each< [ string, Partial< AgencyOverviewContentProps > ] >( [
	[ 'agencies on legacy billing', { billingSystem: 'legacy' } ],
	[ 'agencies pending approval', { approvalStatus: 'pending' } ],
	[ 'rejected agencies', { approvalStatus: 'rejected' } ],
	[ 'users without marketplace access', { capabilities: [ 'a4a_read_referrals' ] } ],
] )( 'hides the Jetpack holiday sale banner from %s', ( _description, props ) => {
	renderOverviewContent( props );
	expect( saleBanner() ).not.toBeInTheDocument();
} );

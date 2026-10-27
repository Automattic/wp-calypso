/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import ContentInfo from '../content-info';
import type { Site } from '@automattic/api-core';

// The blocker-counting tests run against the Calypso backport branch because it
// builds plain string hrefs. The dashboard branch uses TanStack routes, and
// test-utils renders a bare root route, so those hrefs never resolve.
let mockIsBackport = true;

jest.mock( '../../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: () => mockIsBackport,
} ) );

const CURRENT_USER_ID = 1;
const OTHER_USER_ID = 2;

const site = {
	ID: 123,
	slug: 'example.wordpress.com',
	name: 'Example',
	site_owner: OTHER_USER_ID,
} as Site;

function mockPurchases( purchases: object[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( { site: site.ID } )
		.reply( 200, purchases );
}

function purchase( overrides: object = {} ) {
	return {
		ID: 555,
		user_id: CURRENT_USER_ID,
		product_slug: 'personal-bundle',
		is_refundable: false,
		...overrides,
	};
}

const renderContent = () => render( <ContentInfo site={ site } onClose={ jest.fn() } /> );

const findManagePurchases = () => screen.findByRole( 'link', { name: 'Manage purchases' } );

beforeEach( () => {
	mockIsBackport = true;
} );

describe( '<ContentInfo> purchase blockers', () => {
	test( 'links straight to the purchase when a single purchase blocks leaving', async () => {
		mockPurchases( [ purchase( { ID: 555 } ) ] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com/555'
		);
	} );

	test( 'links to the site purchase list when several purchases block leaving', async () => {
		mockPurchases( [ purchase( { ID: 555 } ), purchase( { ID: 556 } ) ] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com'
		);
	} );

	test( 'ignores non-refundable premium themes when counting blockers', async () => {
		mockPurchases( [
			purchase( { ID: 555 } ),
			purchase( { ID: 556, product_slug: 'premium_theme', is_refundable: false } ),
		] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com/555'
		);
	} );

	test( 'counts refundable premium themes as blockers', async () => {
		mockPurchases( [
			purchase( { ID: 555 } ),
			purchase( { ID: 556, product_slug: 'premium_theme', is_refundable: true } ),
		] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com'
		);
	} );

	test( 'ignores purchases belonging to other users when counting blockers', async () => {
		mockPurchases( [ purchase( { ID: 555 } ), purchase( { ID: 556, user_id: OTHER_USER_ID } ) ] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com/555'
		);
	} );

	test( 'offers the leave form when nothing blocks leaving', async () => {
		mockPurchases( [ purchase( { ID: 556, user_id: OTHER_USER_ID } ) ] );
		renderContent();

		expect( await screen.findByRole( 'button', { name: 'Leave site' } ) ).toBeVisible();
	} );

	describe( 'on the dashboard', () => {
		beforeEach( () => {
			mockIsBackport = false;
		} );

		test( 'drops the site filter when a single purchase blocks leaving', async () => {
			mockPurchases( [ purchase( { ID: 555 } ) ] );
			renderContent();

			expect( await findManagePurchases() ).not.toHaveAttribute(
				'href',
				expect.stringContaining( 'site=' )
			);
		} );

		test( 'keeps the site filter when several purchases block leaving', async () => {
			mockPurchases( [ purchase( { ID: 555 } ), purchase( { ID: 556 } ) ] );
			renderContent();

			expect( ( await findManagePurchases() ).getAttribute( 'href' ) ).toContain( 'site=123' );
		} );
	} );
} );

/**
 * @jest-environment jsdom
 */

import { isDashboardBackport } from '../is-dashboard-backport';
import { isJetpackCloud } from '../jetpack';
import { dashboardLinkWithBackport } from '../link';
import { getRenewUrlForPurchases } from '../purchase';
import {
	getPurchaseSettingsRedirectBase,
	getPurchaseSettingsUrl,
	getPurchasesListUrl,
} from '../site-url';
import type { Purchase } from '@automattic/api-core';

jest.mock( '../is-dashboard-backport', () => ( {
	isDashboardBackport: jest.fn(),
} ) );

jest.mock( '../jetpack', () => ( {
	...jest.requireActual( '../jetpack' ),
	isJetpackCloud: jest.fn(),
} ) );

const purchase = {
	ID: 123,
	site_slug: 'example.com',
	product_slug: 'jetpack_backup_t1_yearly',
} as Purchase;

function setEnvironment( {
	backport,
	jetpackCloud,
}: {
	backport: boolean;
	jetpackCloud: boolean;
} ) {
	jest.mocked( isDashboardBackport ).mockReturnValue( backport );
	jest.mocked( isJetpackCloud ).mockReturnValue( jetpackCloud );
}

describe( 'dashboardLinkWithBackport', () => {
	test( 'keeps the path relative in a WordPress.com backport', () => {
		setEnvironment( { backport: true, jetpackCloud: false } );
		expect( dashboardLinkWithBackport( '/purchases/subscriptions/example.com' ) ).toBe(
			'/purchases/subscriptions/example.com'
		);
	} );

	test( 'makes the path absolute on the current origin in Jetpack Cloud', () => {
		setEnvironment( { backport: true, jetpackCloud: true } );
		expect( dashboardLinkWithBackport( '/purchases/subscriptions/example.com' ) ).toBe(
			`${ window.location.origin }/purchases/subscriptions/example.com`
		);
	} );
} );

describe( 'purchase links', () => {
	test( 'point at the Dashboard outside a backport', () => {
		setEnvironment( { backport: false, jetpackCloud: false } );
		expect( getPurchaseSettingsRedirectBase( purchase ) ).toMatch(
			/\/me\/billing\/purchases\/:purchaseId$/
		);
		expect( getPurchaseSettingsUrl( purchase ) ).toMatch( /\/me\/billing\/purchases\/123$/ );
		expect( getPurchasesListUrl( purchase ) ).toMatch( /\/me\/billing\/purchases$/ );
	} );

	test( 'point at the site-level pages in a backport', () => {
		setEnvironment( { backport: true, jetpackCloud: false } );
		expect( getPurchaseSettingsRedirectBase( purchase ) ).toBe(
			'/purchases/subscriptions/example.com/:purchaseId'
		);
		expect( getPurchaseSettingsUrl( purchase ) ).toBe( '/purchases/subscriptions/example.com/123' );
		expect( getPurchasesListUrl( purchase ) ).toBe( '/purchases/subscriptions/example.com' );
	} );

	test( 'point at the Jetpack Cloud site-level pages from Jetpack Cloud', () => {
		setEnvironment( { backport: true, jetpackCloud: true } );
		expect( getPurchaseSettingsUrl( purchase ) ).toBe(
			`${ window.location.origin }/purchases/subscriptions/example.com/123`
		);
	} );

	test( 'fall back to the Dashboard for a siteless purchase in a backport', () => {
		setEnvironment( { backport: true, jetpackCloud: false } );
		expect( getPurchaseSettingsUrl( { ...purchase, site_slug: '' } ) ).toMatch(
			/\/me\/billing\/purchases\/123$/
		);
	} );
} );

describe( 'getRenewUrlForPurchases', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/purchases/subscriptions/example.com/123' );
	} );

	test( 'returns to the current backport page', () => {
		setEnvironment( { backport: true, jetpackCloud: false } );
		const url = new URL( getRenewUrlForPurchases( [ purchase ] ) );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			'/purchases/subscriptions/example.com/123'
		);
		expect( url.searchParams.get( 'cancel_to' ) ).toBe(
			'/purchases/subscriptions/example.com/123'
		);
	} );

	test( 'returns to the current page on its own origin from Jetpack Cloud', () => {
		setEnvironment( { backport: true, jetpackCloud: true } );
		const url = new URL( getRenewUrlForPurchases( [ purchase ] ) );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			`${ window.location.origin }/purchases/subscriptions/example.com/123`
		);
	} );
} );

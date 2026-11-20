/**
 * @jest-environment jsdom
 */

import {
	PLAN_JETPACK_PERSONAL,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
} from '@automattic/calypso-products';
import * as page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { COMPARE_PLANS_QUERY_PARAM } from '../../plans/jetpack-plans/plan-upgrade/constants';
import {
	checkoutWpcomSiteless,
	redirectJetpackLegacyPlans,
	studentCheckoutRedirect,
	studioCheckoutReturn,
} from '../controller';
import StudioReturn from '../studio-return';
import StudioSyncConnect from '../studio-return/sync-connect';
import * as utils from '../utils';

jest.mock( '@automattic/calypso-router' );
jest.mock( '../utils' );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	...jest.requireActual( 'calypso/lib/analytics/tracks' ),
	recordTracksEvent: jest.fn(),
} ) );

const mockStore = configureStore();

describe( 'redirectJetpackLegacyPlans', () => {
	const siteId = 1;
	const siteSlug = 'example.com';
	const store = mockStore( {
		ui: {
			selectedSiteId: siteId,
		},
		sites: {
			items: {
				[ siteId ]: {
					slug: siteSlug,
				},
			},
		},
	} );

	let spy;
	let next;

	beforeEach( () => {
		spy = jest.spyOn( page, 'default' );
		next = jest.fn();
	} );

	afterEach( () => {
		spy.mockRestore();
		next.mockRestore();
	} );

	it( 'should not redirect if the plan is not a Jetpack legacy plan', () => {
		utils.getProductSlugFromContext.mockReturnValue( PRODUCT_JETPACK_BACKUP_T1_YEARLY );

		redirectJetpackLegacyPlans( { store }, next );

		expect( spy ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should redirect if the plan is a Jetpack legacy plan', () => {
		utils.getProductSlugFromContext.mockReturnValue( PLAN_JETPACK_PERSONAL );

		redirectJetpackLegacyPlans( { store }, next );

		const redirectUrl = `/plans/${ siteSlug }?${ COMPARE_PLANS_QUERY_PARAM }=${ PLAN_JETPACK_PERSONAL },${ PRODUCT_JETPACK_BACKUP_T1_YEARLY },${ PRODUCT_JETPACK_ANTI_SPAM }`;

		expect( spy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );
} );

describe( 'checkoutWpcomSiteless', () => {
	it( 'renders checkout with the wpcom siteless type', () => {
		const next = jest.fn();
		const context = {
			params: { productSlug: 'ak_pro5h_yearly' },
			query: {},
			store: mockStore( { currentUser: { id: 7 } } ),
		};

		checkoutWpcomSiteless( context, next );

		const wrapper = context.primary.props.children[ 1 ];
		expect( wrapper.props.sitelessCheckoutType ).toBe( 'wpcom' );
		expect( wrapper.props.productAliasFromUrl ).toBe( 'ak_pro5h_yearly' );
		expect( wrapper.props.isNoSiteCart ).toBe( true );
		expect( next ).toHaveBeenCalled();
	} );
} );

describe( 'studentCheckoutRedirect', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { replace: jest.fn() },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', { configurable: true, value: originalLocation } );
	} );

	it( 'sends /checkout/student to the Student flow with its query', () => {
		studentCheckoutRedirect( { querystring: 'coupon=SAVE10&ref=edu' } );

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/setup/student?coupon=SAVE10&ref=edu'
		);
	} );

	it( 'sends /checkout/student without a query to the Student flow', () => {
		studentCheckoutRedirect( { querystring: '' } );

		expect( window.location.replace ).toHaveBeenCalledWith( '/setup/student' );
	} );
} );

describe( 'studioCheckoutReturn', () => {
	const STUDIO_SITE_ID = 'b419d647-95e0-4b32-95fc-6ee255aa465d';
	let next;

	beforeEach( () => {
		jest.clearAllMocks();
		next = jest.fn();
	} );

	it( 'renders the sync-connect page for a usable publish-flow link', () => {
		const context = {
			query: { studioSiteId: STUDIO_SITE_ID, remoteSiteId: '123', autoOpenPush: 'true' },
		};

		studioCheckoutReturn( context, next );

		expect( context.primary.type ).toBe( StudioSyncConnect );
		expect( context.primary.props ).toEqual( {
			studioSiteId: STUDIO_SITE_ID,
			remoteSiteId: 123,
			autoOpenPush: true,
		} );
		expect( next ).toHaveBeenCalled();
		expect( page.default.redirect ).not.toHaveBeenCalled();
	} );

	it( 'sends a link with an unusable remoteSiteId to /sites without opening Studio', () => {
		const context = { query: { studioSiteId: STUDIO_SITE_ID, remoteSiteId: 'undefined' } };

		studioCheckoutReturn( context, next );

		expect( page.default.redirect ).toHaveBeenCalledWith( '/sites' );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_studio_sync_landing_invalid', {
			reason: 'site_id',
		} );
		expect( context.primary ).toBeUndefined();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'does not fall back to the cancelled-checkout page when studioSiteId is unusable', () => {
		const context = { query: { remoteSiteId: '123' } };

		studioCheckoutReturn( context, next );

		expect( page.default.redirect ).toHaveBeenCalledWith( '/sites' );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_studio_sync_landing_invalid', {
			reason: 'studio_site_id',
		} );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'keeps rendering the cancelled-checkout page without remoteSiteId', () => {
		const context = { query: { studioSiteId: STUDIO_SITE_ID } };

		studioCheckoutReturn( context, next );

		expect( context.primary.type ).toBe( StudioReturn );
		expect( next ).toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'still sends a link with neither id to /sites without a sync event', () => {
		const context = { query: {} };

		studioCheckoutReturn( context, next );

		expect( page.default.redirect ).toHaveBeenCalledWith( '/sites' );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );
} );

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
import { COMPARE_PLANS_QUERY_PARAM } from '../../plans/jetpack-plans/plan-upgrade/constants';
import { redirectJetpackLegacyPlans, checkoutJetpackSiteless } from '../controller';
import * as utils from '../utils';

jest.mock( '@automattic/calypso-router' );
jest.mock( '../utils' );

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

describe( 'checkoutJetpackSiteless', () => {
	let pageSpy;
	let next;

	const query = {
		connect_after_checkout: true,
		from_site_slug: 'example.com',
		admin_url: encodeURIComponent( 'https://example.com/wp-admin' ),
	};

	const context = {
		store: mockStore( {
			currentUser: {
				id: 1,
			},
		} ),
		query,
		params: {},
		path: `/checkout/jetpack/jetpack_backup_t1_yearly?connect_after_checkout=${ query.connect_after_checkout }&admin_url=${ query.admin_url }&from_site_slug=${ query.from_site_slug }`,
	};

	beforeEach( () => {
		pageSpy = jest.spyOn( page, 'default' );
		next = jest.fn();
	} );

	afterEach( () => {
		pageSpy.mockRestore();
		next.mockRestore();
	} );

	it( 'should redirect to regular checkout if user is logged-in and passing a site', () => {
		const redirectUrl = context.path.replace(
			'/checkout/jetpack',
			`/checkout/${ query.from_site_slug }`
		);
		checkoutJetpackSiteless( context, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'should call next if user is not logged-in', () => {
		const noUserContext = {
			...context,
			store: mockStore( {
				currentUser: { id: null },
			} ),
		};

		checkoutJetpackSiteless( noUserContext, next );

		expect( pageSpy ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );

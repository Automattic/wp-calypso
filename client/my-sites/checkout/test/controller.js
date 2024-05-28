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
import addQueryArgs from 'calypso/lib/url/add-query-args';
import { COMPARE_PLANS_QUERY_PARAM } from '../../plans/jetpack-plans/plan-upgrade/constants';
import { checkout, redirectJetpackLegacyPlans } from '../controller';
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

describe( 'checkout', () => {
	let pageSpy;
	let next;

	const query = {
		site: 'example.com',
		redirect_to: encodeURIComponent( 'http://example.com/wp-admin/admin.php?page=my-jetpack' ),
		source: 'my-jetpack',
	};

	const context = {
		store: mockStore( {
			currentUser: {
				id: null,
			},
			ui: {
				selectedSiteId: null,
			},
		} ),
		query,
		params: {},
		path: addQueryArgs( query, `/checkout/123123/jetpack_backup_t1_yearly` ),
		pathname: '/checkout/123123/jetpack_backup_t1_yearly',
	};

	beforeEach( () => {
		pageSpy = jest.spyOn( page, 'default' );
		next = jest.fn();
	} );

	afterEach( () => {
		pageSpy.mockRestore();
		next.mockRestore();
	} );

	it( 'should redirect checkout with site id to siteless checkout if user is not logged in', () => {
		const redirectUrl = addQueryArgs(
			{
				connect_after_checkout: true,
				from_site_slug: context.query.site,
				admin_url: context.query.redirect_to.split( '?' )[ 0 ],
			},
			context.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		checkout( context, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should redirect checkout with site slug to siteless checkout if user is not logged in', () => {
		const contextWithSiteSlug = {
			...context,
			path: addQueryArgs( query, `/checkout/example.com/jetpack_backup_t1_yearly` ),
			pathname: '/checkout/example.com/jetpack_backup_t1_yearly',
		};
		const redirectUrl = addQueryArgs(
			{
				connect_after_checkout: true,
				from_site_slug: context.query.site,
				admin_url: context.query.redirect_to.split( '?' )[ 0 ],
			},
			context.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		checkout( contextWithSiteSlug, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).toHaveBeenCalled();
	} );
} );

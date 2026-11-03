/**
 * @jest-environment jsdom
 */

import * as page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import addQueryArgs from 'calypso/lib/url/add-query-args';
import { redirectMyJetpack } from '../controller';

jest.mock( '@automattic/calypso-router' );

const mockStore = configureStore();

describe( 'redirectMyJetpack', () => {
	let pageSpy;
	let next;

	const query = {
		site: 'example.com',
		redirect_to: 'http://example.com/wp-admin/admin.php?page=my-jetpack',
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
		params: {
			// These properties are parsed from the path
			domainOrProduct: 'jetpack_backup_t1_yearly',
			product: '196967475',
		},
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
				admin_url: 'http://example.com/wp-admin/',
			},
			context.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		redirectMyJetpack( context, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
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
				admin_url: 'http://example.com/wp-admin/',
			},
			context.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		redirectMyJetpack( contextWithSiteSlug, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );

	const buildStatsContext = ( source ) => {
		const statsQuery = { ...query, source };
		const productSlug = 'jetpack_stats_yearly:-q-10000';
		return {
			...context,
			query: statsQuery,
			params: { domainOrProduct: productSlug, product: '123123' },
			path: addQueryArgs( statsQuery, `/checkout/123123/${ productSlug }` ),
			pathname: `/checkout/123123/${ productSlug }`,
		};
	};

	it.each( [ 'my-jetpack', 'jetpack_premium_analytics_upsell' ] )(
		'sends a logged-out buyer of a Stats tier with source=%s to siteless checkout',
		( source ) => {
			const statsContext = buildStatsContext( source );
			const redirectUrl = addQueryArgs(
				{
					connect_after_checkout: true,
					from_site_slug: statsContext.query.site,
					admin_url: 'http://example.com/wp-admin/',
				},
				statsContext.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
			);

			redirectMyJetpack( statsContext, next );

			expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
			expect( next ).not.toHaveBeenCalled();
		}
	);

	it( 'sends a logged-out buyer without redirect_to to siteless checkout without admin_url', () => {
		const statsContext = buildStatsContext( 'jetpack_premium_analytics_upsell' );
		const queryWithoutRedirect = { ...statsContext.query, redirect_to: undefined };
		const contextWithoutRedirect = {
			...statsContext,
			query: queryWithoutRedirect,
			path: addQueryArgs( queryWithoutRedirect, statsContext.pathname ),
		};
		const redirectUrl = addQueryArgs(
			{
				connect_after_checkout: true,
				from_site_slug: queryWithoutRedirect.site,
			},
			contextWithoutRedirect.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		redirectMyJetpack( contextWithoutRedirect, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'https://example.com/wp-admin/admin.php?page=my-jetpack', 'https://example.com/wp-admin/' ],
		[
			'https://example.com/blog/wp-admin/admin.php?page=my-jetpack',
			'https://example.com/blog/wp-admin/',
		],
		[ 'https://example.com/wp-admin/', 'https://example.com/wp-admin/' ],
		[ 'https://example.com/some-page/', undefined ],
		[ 'https://example.com/?next=/wp-admin/', undefined ],
	] )( 'sends redirect_to %s to siteless checkout with admin_url %s', ( redirectTo, adminUrl ) => {
		const redirectQuery = { ...query, redirect_to: redirectTo };
		const redirectContext = {
			...context,
			query: redirectQuery,
			path: addQueryArgs( redirectQuery, context.pathname ),
		};
		const redirectUrl = addQueryArgs(
			{
				connect_after_checkout: true,
				from_site_slug: redirectQuery.site,
				admin_url: adminUrl,
			},
			redirectContext.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		redirectMyJetpack( redirectContext, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );

	it.each( [ 'jetpack_premium_analytics_onboarding', 'jetpack-newsletter', undefined ] )(
		'leaves a logged-out buyer with source=%s to the login redirect',
		( source ) => {
			redirectMyJetpack( buildStatsContext( source ), next );

			expect( pageSpy ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalled();
		}
	);
} );

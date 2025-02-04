/**
 * @jest-environment jsdom
 */

import * as page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import addQueryArgs from 'calypso/lib/url/add-query-args';
import { redirectMyJetpack } from '../index.web';

jest.mock( '@automattic/calypso-router' );

const mockStore = configureStore();

describe( 'redirectMyJetpack', () => {
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
				admin_url: context.query.redirect_to.split( '?' )[ 0 ],
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
				admin_url: context.query.redirect_to.split( '?' )[ 0 ],
			},
			context.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		redirectMyJetpack( contextWithSiteSlug, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );
} );

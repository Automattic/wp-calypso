/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import isSiteA4ADevSite from 'calypso/state/selectors/is-site-a4a-dev-site';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import { a4aDevSiteNotSupportedRedirect } from '../controller';

// Mock the leaf selector modules; the barrels that `controller` imports from
// re-export these defaults, so the barrel imports resolve to these mocks too.
jest.mock( 'calypso/state/selectors/is-site-a4a-dev-site' );
jest.mock( 'calypso/state/ui/selectors/get-selected-site' );
jest.mock( 'calypso/state/sites/selectors/get-site-slug' );

describe( 'a4aDevSiteNotSupportedRedirect', () => {
	const context = { store: { getState: () => ( {} ) } };

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'redirects A4A dev sites to the site home', () => {
		const redirect = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		const next = jest.fn();
		getSelectedSite.mockReturnValue( { ID: 12345 } );
		isSiteA4ADevSite.mockReturnValue( true );
		getSiteSlug.mockReturnValue( 'example.com' );

		a4aDevSiteNotSupportedRedirect( context, next );

		expect( redirect ).toHaveBeenCalledWith( '/home/example.com' );
		expect( next ).not.toHaveBeenCalled();

		redirect.mockRestore();
	} );

	it( 'does not redirect when the selected site is not an A4A dev site', () => {
		const redirect = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		const next = jest.fn();
		getSelectedSite.mockReturnValue( { ID: 12345 } );
		isSiteA4ADevSite.mockReturnValue( false );

		a4aDevSiteNotSupportedRedirect( context, next );

		expect( redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );

		redirect.mockRestore();
	} );

	it( 'does not redirect when there is no selected site', () => {
		const redirect = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		const next = jest.fn();
		getSelectedSite.mockReturnValue( null );

		a4aDevSiteNotSupportedRedirect( context, next );

		expect( redirect ).not.toHaveBeenCalled();
		expect( isSiteA4ADevSite ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );

		redirect.mockRestore();
	} );
} );

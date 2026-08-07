/**
 * @jest-environment jsdom
 */

import { getConnectionSpeedData } from '@automattic/calypso-analytics';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getSuperProps from '../super-props';

jest.mock( '@automattic/calypso-analytics', () => ( {
	getConnectionSpeedData: jest.fn(),
} ) );
jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( ( key ) => key );
	config.isEnabled = jest.fn( () => false );
	return config;
} );
jest.mock( 'calypso/lib/analytics/utils', () => ( {
	shouldReportOmitBlogId: jest.fn( ( path ) => path === '/me' ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserSiteCount: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/get-current-route', () => jest.fn() );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: jest.fn(),
} ) );

const state = {};
const reduxStore = { getState: () => state };
const selectedSite = {
	ID: 111,
	lang: 'en',
	jetpack: false,
	plan: { product_id: 1 },
};
const explicitSite = {
	ID: 222,
	lang: 'fr',
	jetpack: true,
	plan: { product_id: 2 },
};

describe( 'analytics super props', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		getConnectionSpeedData.mockReturnValue( {} );
		getCurrentUserSiteCount.mockReturnValue( 2 );
		getCurrentRoute.mockReturnValue( '/home/example.wordpress.com' );
		getSelectedSite.mockReturnValue( selectedSite );
		getSite.mockImplementation( ( _, siteId ) =>
			siteId === explicitSite.ID ? explicitSite : null
		);
	} );

	test( 'uses explicit blog_id instead of selected site', () => {
		const superProps = getSuperProps( reduxStore )( { blog_id: explicitSite.ID } );

		expect( superProps ).toEqual(
			expect.objectContaining( {
				blog_id: explicitSite.ID,
				blog_lang: explicitSite.lang,
				site_id_label: 'jetpack',
				site_plan_id: explicitSite.plan.product_id,
			} )
		);
		expect( getSelectedSite ).not.toHaveBeenCalled();
	} );

	test( 'preserves explicit blog_id when site is not in Redux', () => {
		getSite.mockReturnValue( null );

		const superProps = getSuperProps( reduxStore )( { blog_id: 333 } );

		expect( superProps.blog_id ).toBe( 333 );
		expect( superProps ).not.toHaveProperty( 'blog_lang' );
		expect( superProps ).not.toHaveProperty( 'site_id_label' );
		expect( superProps ).not.toHaveProperty( 'site_plan_id' );
		expect( getSelectedSite ).not.toHaveBeenCalled();
	} );

	test( 'preserves explicit blog_id on routes that omit ambient site context', () => {
		getCurrentRoute.mockReturnValue( '/me' );

		const superProps = getSuperProps( reduxStore )( { blog_id: explicitSite.ID } );

		expect( superProps.blog_id ).toBe( explicitSite.ID );
		expect( superProps.blog_lang ).toBe( explicitSite.lang );
		expect( getSelectedSite ).not.toHaveBeenCalled();
	} );

	test( 'keeps selected-site behavior when blog_id is not explicit', () => {
		const superProps = getSuperProps( reduxStore )( {} );

		expect( superProps ).toEqual(
			expect.objectContaining( {
				blog_id: selectedSite.ID,
				blog_lang: selectedSite.lang,
				site_id_label: 'wpcom',
				site_plan_id: selectedSite.plan.product_id,
			} )
		);
	} );

	test( 'keeps selected-site behavior when current route is unavailable', () => {
		getCurrentRoute.mockReturnValue( null );

		const superProps = getSuperProps( reduxStore )( {} );

		expect( superProps.blog_id ).toBe( selectedSite.ID );
	} );

	test( 'ignores invalid explicit blog_id', () => {
		const superProps = getSuperProps( reduxStore )( { blog_id: 0 } );

		expect( superProps.blog_id ).toBe( selectedSite.ID );
	} );
} );

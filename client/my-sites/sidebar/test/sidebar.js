/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { MySitesSidebar } from '../sidebar';
import config from 'config';
import { abtest } from 'lib/abtest';

jest.mock( 'lib/user', () => null );
jest.mock( 'lib/user/index', () => null );
jest.mock( 'lib/analytics/index', () => null );
jest.mock( 'lib/abtest', () => ( {
	abtest: jest.fn( () => {
		return 'sidebarUpsells';
	} ),
} ) );
jest.mock( 'lib/cart/store/index', () => null );
jest.mock( 'my-sites/sidebar/manage-menu', () => null );
jest.mock( 'lib/analytics/track-component-view', () => 'TrackComponentView' );
jest.mock( 'my-sites/sidebar/utils', () => ( {
	itemLinkMatches: jest.fn( () => true ),
} ) );
jest.mock( 'config', () => ( {
	isEnabled: jest.fn( () => true ),
} ) );

jest.mock( 'config/index', () => ( {
	isEnabled: jest.fn( () => true ),
} ) );

describe( 'MySitesSidebar', () => {
	describe( 'MySitesSidebar.store()', () => {
		const defaultProps = {
			site: {},
			siteSuffix: '/mysite.com',
			translate: x => x,
		};

		beforeEach( () => {
			config.isEnabled.mockImplementation( () => true );
			abtest.mockImplementation( () => 'sidebarUpsells' );
		} );

		test( 'Should return null item if woocommerce/extension-dashboard is disabled', () => {
			config.isEnabled.mockImplementation(
				feature => feature !== 'woocommerce/extension-dashboard'
			);
			const Sidebar = new MySitesSidebar( {
				isSiteAutomatedTransfer: false,
				canUserManageOptions: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return store menu item if user can use store on this site', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.props().link ).toEqual( '/store/mysite.com' );
		} );

		test( 'Should return null item if user can not use store on this site (nudge-a-palooza disabled)', () => {
			config.isEnabled.mockImplementation( feature => feature !== 'upsell/nudge-a-palooza' );
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return null item if managing user can not use store on this site (control a/b group)', () => {
			abtest.mockImplementation( () => 'control' );
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				canUserManageOptions: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return null if non-managing user can not use store on this site (control a/b group)', () => {
			abtest.mockImplementation( () => 'control' );
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				canUserManageOptions: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return upsell item if managing user can not use store on this site (nudge-a-palooza enabled)', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				canUserManageOptions: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.props().link ).toEqual( '/feature/store/mysite.com' );
		} );

		test( 'Should return upsell if non-managing user can not use store on this site (nudge-a-palooza enabled)', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				canUserManageOptions: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.props().link ).toEqual( '/feature/store/mysite.com' );
		} );
	} );

	describe( 'MySitesSidebar.ads()', () => {
		const defaultProps = {
			site: {},
			siteSuffix: '/mysite.com',
			translate: x => x,
		};

		beforeEach( () => {
			config.isEnabled.mockImplementation( () => true );
			abtest.mockImplementation( () => 'sidebarUpsells' );
		} );

		test( 'Should return ads menu item if user can use ads on this site', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseAds: true,
				...defaultProps,
			} );
			const Ads = () => Sidebar.ads();

			const wrapper = shallow( <Ads /> );
			expect( wrapper.props().link ).toEqual( '/ads/earnings/mysite.com' );
		} );

		test( "Should return null if user can't use ads on this site and nudge-a-palooza is disabled", () => {
			config.isEnabled.mockImplementation( feature => feature !== 'upsell/nudge-a-palooza' );
			const Sidebar = new MySitesSidebar( {
				canUserUseAds: false,
				...defaultProps,
			} );
			const Ads = () => Sidebar.ads();

			const wrapper = shallow( <Ads /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( "Should return null if user can't use ads on this site and user is in control A/B test group", () => {
			abtest.mockImplementation( () => 'control' );
			const Sidebar = new MySitesSidebar( {
				canUserUseAds: false,
				...defaultProps,
			} );
			const Ads = () => Sidebar.ads();

			const wrapper = shallow( <Ads /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( "Should return upsell menu item if user can't use ads on this site but can manage options and upgrade site", () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseAds: false,
				canUserManageOptions: true,
				canUserUpgradeSite: true,
				...defaultProps,
			} );
			const Ads = () => Sidebar.ads();

			const wrapper = shallow( <Ads /> );
			expect( wrapper.props().link ).toEqual( '/feature/ads/mysite.com' );
		} );

		test( "Should return null if user can't use ads on this site and can't manage options or upgrade site", () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseAds: false,
				canUserManageOptions: false,
				canUserUpgradeSite: false,
				...defaultProps,
			} );
			const Ads = () => Sidebar.ads();

			const wrapper = shallow( <Ads /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( "Should return null if user can't use ads on this site and can manage options but can't upgrade site", () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseAds: false,
				canUserManageOptions: true,
				canUserUpgradeSite: false,
				...defaultProps,
			} );
			const Ads = () => Sidebar.ads();

			const wrapper = shallow( <Ads /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( "Should return null if user can't use ads on this site and can't manage options but can upgrade site", () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseAds: false,
				canUserManageOptions: false,
				canUserUpgradeSite: true,
				...defaultProps,
			} );
			const Ads = () => Sidebar.ads();

			const wrapper = shallow( <Ads /> );
			expect( wrapper.html() ).toEqual( null );
		} );
	} );
} );

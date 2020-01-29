/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { MySitesSidebar } from '..';
import config from 'config';
import { abtest } from 'lib/abtest';

jest.mock( 'lib/user', () => null );
jest.mock( 'lib/user/index', () => () => {} );
jest.mock( 'lib/analytics/index', () => null );
jest.mock( 'lib/abtest', () => ( {
	abtest: jest.fn( () => {
		return 'sidebarUpsells';
	} ),
} ) );
jest.mock( 'lib/cart/store/index', () => null );
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
				canUserUpgradeSite: true,
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
				site: {
					plan: {
						product_slug: 'business-bundle',
					},
				},
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.props().link ).toEqual( '/store/mysite.com' );
		} );

		test( 'Should return Calypsoified store menu item if user can use store on this site and the site is an ecommerce plan', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: true,
				...defaultProps,
				site: {
					options: {
						admin_url: 'http://test.com/wp-admin/',
					},
					plan: {
						product_slug: 'ecommerce-bundle',
					},
				},
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.props().link ).toEqual(
				'http://test.com/wp-admin/admin.php?page=wc-setup-checklist'
			);
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

		test( 'Should return null item if user who can upgrade can not use store on this site (control a/b group)', () => {
			abtest.mockImplementation( () => 'control' );
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				canUserUpgradeSite: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( "Should return null if user who can't upgrade  user can not use store on this site (control a/b group)", () => {
			abtest.mockImplementation( () => 'control' );
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				canUserUpgradeSite: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );
	} );
} );

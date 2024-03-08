/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';

describe( 'AppPromoSidebar', () => {
	const appPromoSidebarDetails = {
		promoCode: 'a0001',
		message: 'WordPress.com your way  — desktop app now available for Mac, Windows, and Linux.',
	};
	const appPromoSidebarLink = 'http://www.wordpress.com';

	let AppPromoSidebar;
	let AppPromoSidebarComponent;
	let getPromoLink;
	const defaultPropsToRender = {
		location: 'reader',
		promoItem: appPromoSidebarDetails,
		getPromoLink: () => appPromoSidebarLink,
		translate: ( string ) => string,
	};
	// The reason we don't import this higher up is this component can't be
	// imported until the fake DOM is setup.
	beforeAll( () => {
		AppPromoSidebar = require( '..' ).AppPromoSidebar;
		getPromoLink = require( '..' ).getPromoLink;
		AppPromoSidebarComponent = <AppPromoSidebar { ...defaultPropsToRender } />;
	} );

	describe( 'readering', () => {
		test( 'should render the primary components', () => {
			const { container } = render( AppPromoSidebarComponent );

			expect( container.getElementsByClassName( 'app-promo-sidebar' ) ).toHaveLength( 1 );
			expect( container.getElementsByClassName( 'app-promo-sidebar__dismiss' ) ).toHaveLength( 1 );
			expect( container.getElementsByClassName( 'app-promo-sidebar__icon' ) ).toHaveLength( 1 );
		} );

		test( 'should render the promo text', () => {
			const { container } = render( AppPromoSidebarComponent );

			expect( container.textContent ).toEqual(
				expect.stringContaining( appPromoSidebarDetails.message )
			);
		} );

		test( 'should render the promo link', () => {
			const { container } = render( AppPromoSidebarComponent );

			const promoLink = container.getElementsByClassName( 'app-promo-sidebar__link' );
			expect( promoLink ).toHaveLength( 1 );
			expect( promoLink[ 0 ].getAttribute( 'href' ) ).toBe( appPromoSidebarLink );
		} );
	} );

	describe( 'getPromoLink', () => {
		const mobilePromo = {
			promoCode: 'a0006',
			message: 'WordPress.com in the palm of your hands — download app for mobile.',
			type: 'mobile',
		};

		const desktopPromo = {
			promoCode: 'a0005',
			message: 'WordPress.com at your fingertips — download app for desktop.',
			type: 'desktop',
		};

		test( 'should render a mobile link when the mobile promo code is passed in', () => {
			expect( getPromoLink( 'reader', mobilePromo ) ).toEqual(
				expect.stringContaining( 'mobile' )
			);
		} );

		test( 'should render a desktop link when the desktop promo code is passed in', () => {
			expect( getPromoLink( 'reader', desktopPromo ) ).toEqual(
				expect.stringContaining( 'desktop' )
			);
		} );
	} );
} );

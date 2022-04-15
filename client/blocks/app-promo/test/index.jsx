/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { expect } from 'chai';

describe( 'AppPromo', () => {
	const appPromoDetails = {
		promoCode: 'a0001',
		message: 'WordPress.com your way  — desktop app now available for Mac, Windows, and Linux.',
	};
	const appPromoLink = 'http://www.wordpress.com';

	let AppPromo;
	let AppPromoComponent;
	let getPromoLink;
	const defaultPropsToRender = {
		location: 'reader',
		promoItem: appPromoDetails,
		getPromoLink: () => appPromoLink,
		translate: ( string ) => string,
	};
	// The reason we don't import this higher up is this component can't be
	// imported until the fake DOM is setup.
	beforeAll( () => {
		AppPromo = require( '..' ).AppPromo;
		getPromoLink = require( '..' ).getPromoLink;
		AppPromoComponent = <AppPromo { ...defaultPropsToRender } />;
	} );

	describe( 'readering', () => {
		test( 'should render the primary components', () => {
			const { container } = render( AppPromoComponent );

			expect( container.getElementsByClassName( 'app-promo' ) ).to.have.lengthOf( 1 );
			expect( container.getElementsByClassName( 'app-promo__dismiss' ) ).to.have.lengthOf( 1 );
			expect( container.getElementsByClassName( 'app-promo__icon' ) ).to.have.lengthOf( 1 );
		} );

		test( 'should render the promo text', () => {
			const { container } = render( AppPromoComponent );

			expect( container.textContent ).to.contain( appPromoDetails.message );
		} );

		test( 'should render the promo link', () => {
			const { container } = render( AppPromoComponent );

			const promoLink = container.getElementsByClassName( 'app-promo__link' );
			expect( promoLink ).to.have.lengthOf( 1 );
			expect( promoLink[ 0 ].getAttribute( 'href' ) ).to.equal( appPromoLink );
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
			expect( getPromoLink( 'reader', mobilePromo ) ).to.include( 'mobile' );
		} );

		test( 'should render a desktop link when the desktop promo code is passed in', () => {
			expect( getPromoLink( 'reader', desktopPromo ) ).to.include( 'desktop' );
		} );
	} );
} );

/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

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
			const wrapper = shallow( AppPromoComponent );

			expect( wrapper ).to.have.descendants( '.app-promo' );
			expect( wrapper ).to.have.descendants( '.app-promo__dismiss' );
			expect( wrapper ).to.have.descendants( '.app-promo__icon' );
		} );

		test( 'should render the promo text', () => {
			const wrapper = shallow( AppPromoComponent );

			expect( wrapper.text() ).to.contain( appPromoDetails.message );
		} );

		test( 'should render the promo link', () => {
			const wrapper = shallow( AppPromoComponent );

			const promoLink = wrapper.find( '.app-promo__link' );
			expect( promoLink ).to.have.lengthOf( 1 );
			expect( promoLink ).to.have.prop( 'href' ).equal( appPromoLink );
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

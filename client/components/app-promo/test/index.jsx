import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import mockery from 'mockery';

import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'AppPromo', ( ) => {
	useFakeDom();
	useMockery();

	const desktopPromoKey = 'desktop_promo_dismissed';
	let desktopPromoDismissed = false;
	let localeSlug = 'en';
	let isMobile = false;
	let isChromeOS = false;

	const storeMock = {
		get: ( val ) => {
			if ( val === desktopPromoKey ) {
				return desktopPromoDismissed;
			}

			return undefined;
		},
		set: spy()
	};

	const userUtilsMock = { getLocaleSlug: ( ) => localeSlug };
	const viewportMock = { isMobile: ( ) => isMobile };
	const userAgentUtilsMock = { isChromeOS: ( ) => isChromeOS };
	const appPromoDetails = {
		promo_code: 'a0001',
		message: 'WordPress.com your way  — desktop app now available for Mac, Windows, and Linux.'
	};
	const appPromoLink = 'http://www.wordpress.com';
	const promoRetrieverMock = {
		getRandomPromo: ( ) => appPromoDetails,
		getPromoLink: ( ) => appPromoLink
	};

	let AppPromo;
	let AppPromoComponent;

	before( ( ) => {
		mockery.registerMock( 'store', storeMock );
		mockery.registerMock( 'lib/user/utils', userUtilsMock );
		mockery.registerMock( 'lib/user-agent-utils', userAgentUtilsMock );
		mockery.registerMock( 'lib/viewport', viewportMock );
		mockery.registerMock( './lib/promo-retriever', promoRetrieverMock );
		AppPromo = require( '..' ).AppPromo;
		AppPromoComponent = ( <AppPromo location="reader" /> );
	} );

	beforeEach( ( ) => {
		desktopPromoDismissed = false;
		localeSlug = 'en';
		isMobile = false;
		isChromeOS = false;
	} );

	it( 'should render nothing when the promo has already been dismissed', ( ) => {
		desktopPromoDismissed = true;
		const wrapper = mount( AppPromoComponent );
		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should render nothing when the locale is not english', ( ) => {
		localeSlug = 'fr';
		const wrapper = mount( AppPromoComponent );
		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should render nothing when the viewport indicates mobile', ( ) => {
		isMobile = true;
		const wrapper = mount( AppPromoComponent );
		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should render nothing when being viewed on ChromeOS', ( ) => {
		isChromeOS = true;
		const wrapper = mount( AppPromoComponent );
		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 0 );
	} );

	context( 'when the user hasn\'t dismissed the promo, aren\'t on mobile or chrome os', ( ) => {
		it( 'should render the primary components', ( ) => {
			const wrapper = mount( AppPromoComponent );

			expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__dismiss' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__screen-reader-text' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__icon' ) ).to.have.lengthOf( 1 );
		} );

		it( 'should render the promo text', ( ) => {
			const wrapper = mount( AppPromoComponent );

			expect( wrapper.text() ).to.contain( appPromoDetails.message );
		} );

		it( 'should render the promo link', ( ) => {
			const wrapper = mount( AppPromoComponent );

			const promoLink = wrapper.find( '.app-promo__link' );
			expect( promoLink ).to.have.lengthOf( 1 );
			expect( promoLink.props().href ).to.equal( appPromoLink );
		} );
	} );
} );

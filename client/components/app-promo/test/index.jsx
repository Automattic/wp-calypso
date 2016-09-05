import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy, stub } from 'sinon';
import mockery from 'mockery';

import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'AppPromo', ( ) => {
	let AppPromo;
	const store = createStore( stub() );

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

	const appStoreComponent = ( ) => {
		return (
			<Provider store={ store } >
				<AppPromo location="reader" />
			</Provider>
			);
	};

	before( ( ) => {
		mockery.registerMock( 'store', storeMock );
		mockery.registerMock( 'lib/user/utils', userUtilsMock );
		mockery.registerMock( 'lib/user-agent-utils', userAgentUtilsMock );
		mockery.registerMock( 'lib/viewport', viewportMock );

		AppPromo = require( '../' );
	} );

	beforeEach( ( ) => {
		desktopPromoDismissed = false;
		localeSlug = 'en';
		isMobile = false;
		isChromeOS = false;
	} );

	it( 'should render nothing when the promo has already been dismissed', ( ) => {
		desktopPromoDismissed = true;
		const wrapper = mount( appStoreComponent() );
		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should render nothing when the locale is not english', ( ) => {
		localeSlug = 'fr';
		const wrapper = mount( appStoreComponent() );
		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should render nothing when the viewport indicates mobile', ( ) => {
		isMobile = true;
		const wrapper = mount( appStoreComponent() );
		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should render nothing when being viewed on ChromeOS', ( ) => {
		isChromeOS = true;
		const wrapper = mount( appStoreComponent() );
		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 0 );
	} );

	context( 'when the user hasn\'t dismissed the promo, aren\'t on mobile or chrome os', ( ) => {
		it( 'should render the primary components', ( ) => {
			const wrapper = mount( appStoreComponent() );

			expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__dismiss' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__screen-reader-text' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__icon' ) ).to.have.lengthOf( 1 );
		} );
	} );
} );

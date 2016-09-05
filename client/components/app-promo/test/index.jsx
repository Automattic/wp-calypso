import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import mockery from 'mockery';

import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'AppPromo', ( ) => {
	useFakeDom();
	useMockery();

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
		mockery.registerMock( './lib/promo-retriever', promoRetrieverMock );
		AppPromo = require( '..' ).AppPromo;
		AppPromoComponent = ( <AppPromo location="reader" isLocaleEnglish={ true } /> );
	} );

	it( 'should render nothing when the promo has already been dismissed', ( ) => {
		const wrapper = shallow( <AppPromo location="reader" isDesktopPromoDisabled={ true } />  );
		expect( wrapper.children().isEmpty() ).to.be.true;
	} );

	it( 'should render nothing when the locale is not english', ( ) => {
		const wrapper = shallow( <AppPromo location="reader" isLocaleEnglish={ false } />  );
		expect( wrapper.children().isEmpty() ).to.be.true;
	} );

	it( 'should render nothing when the viewport indicates mobile', ( ) => {
		const wrapper = shallow( <AppPromo location="reader" isViewportMobile={ false } />  );
		expect( wrapper.children().isEmpty() ).to.be.true;
	} );

	it( 'should render nothing when being viewed on ChromeOS', ( ) => {
		const wrapper = shallow( <AppPromo location="reader" isChromeOS={ true } />  );
		expect( wrapper.children().isEmpty() ).to.be.true;
	} );

	context( 'when the user hasn\'t dismissed the promo, aren\'t on mobile or chrome os', ( ) => {
		it( 'should render the primary components', ( ) => {
			const wrapper = shallow( AppPromoComponent );

			expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__dismiss' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__screen-reader-text' ) ).to.have.lengthOf( 1 );
			expect( wrapper.find( '.app-promo__icon' ) ).to.have.lengthOf( 1 );
		} );

		it( 'should render the promo text', ( ) => {
			const wrapper = shallow( AppPromoComponent );

			expect( wrapper.text() ).to.contain( appPromoDetails.message );
		} );

		it( 'should render the promo link', ( ) => {
			const wrapper = shallow( AppPromoComponent );

			const promoLink = wrapper.find( '.app-promo__link' );
			expect( promoLink ).to.have.lengthOf( 1 );
			expect( promoLink.props().href ).to.equal( appPromoLink );
		} );
	} );
} );

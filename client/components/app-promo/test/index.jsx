import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'AppPromo', ( ) => {
	useFakeDom();

	const appPromoDetails = {
		promoCode: 'a0001',
		message: 'WordPress.com your way  — desktop app now available for Mac, Windows, and Linux.'
	};
	const appPromoLink = 'http://www.wordpress.com';

	let AppPromo;
	let AppPromoComponent;
	const defaultPropsToRender = {
		location: 'reader',
		promoItem: appPromoDetails,
		getPromoLink: () => appPromoLink
	};
	before( ( ) => {
		AppPromo = require( '..' ).AppPromo;
		AppPromoComponent = ( <AppPromo { ...defaultPropsToRender } /> );
	} );

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

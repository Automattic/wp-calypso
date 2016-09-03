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

	const storeMock = {
		get: spy(),
		set: spy()
	};

	const userUtilsMock = { getLocaleSlug: ( ) => 'en' };

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

		AppPromo = require( '../' );
	} );

	it( 'should do something', ( ) => {
		const wrapper = mount( appStoreComponent() );

		expect( wrapper.find( '.app-promo' ) ).to.have.lengthOf( 1 );
	} );
} );

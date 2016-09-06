import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import mockery from 'mockery';

import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'ReaderSidebar', ( ) => {
	let ReaderSidebar, ReaderSidebarComponent;
	const defaultPropsToRender = {
		path: '/',
		isDesktopPromoDisabled: false,
		isUserLocaleEnglish: true,
		isViewportMobile: false,
		isChromeOS: false,
		isDesktopPromoConfiguredToRun: true,
		isUserDesktopAppUser: false
	};

	useFakeDom();
	useMockery();

	before( ( ) => {
		mockery.registerMock( 'component-closest', stub() );
		ReaderSidebar = require( '..' ).ReaderSidebar;
		ReaderSidebarComponent = ( <ReaderSidebar { ...defaultPropsToRender } /> );
	} );

	context( 'AppPromo', ( ) => {
		it( 'should not render if desktop promo is disabled', ( ) => {
			const adjustedProperties = Object.assign( {}, defaultPropsToRender, { isUserLocaleEnglish: false } );
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 0 );
		} );

		it( 'should not render if user locale isn\'t english', ( ) => {
			const adjustedProperties = Object.assign( {}, defaultPropsToRender, { isUserDesktopAppUser: true } );
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 0 );
		} );

		it( 'should not render if the viewport is mobile', ( ) => {
			const adjustedProperties = Object.assign( {}, defaultPropsToRender, { isUserDesktopAppUser: true } );
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 0 );
		} );

		it( 'should not render if it\'s ChromeOS', ( ) => {
			const adjustedProperties = Object.assign( {}, defaultPropsToRender, { isUserDesktopAppUser: true } );
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 0 );
		} );

		it( 'should not render if desktop promo isn\'t configured to run', ( ) => {
			const adjustedProperties = Object.assign( {}, defaultPropsToRender, { isUserDesktopAppUser: true } );
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 0 );
		} );

		it( 'should not render if user is a desktop app user', ( ) => {
			const adjustedProperties = Object.assign( {}, defaultPropsToRender, { isUserDesktopAppUser: true } );
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 0 );
		} );

		it( 'should render if desktop promo wasn\'t disabled by the user, the locale is english, the viewport isn\'t mobile, it\'s not ChromeOS, the desktop promo is configured to run, and the user isn\'t a desktop app user', ( ) => {
			const wrapper = shallow( ReaderSidebarComponent );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 1 );
		} );
	} );
} );

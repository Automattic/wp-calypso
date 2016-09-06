import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import mockery from 'mockery';

import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'ReaderSidebar', ( ) => {
	let ReaderSidebar

	let shouldRenderAppPromo;
	const shouldRenderAppPromoDefaultProps = {
		isDesktopPromoDisabled: false,
		isUserLocaleEnglish: true,
		isViewportMobile: false,
		isChromeOS: false,
		isDesktopPromoConfiguredToRun: true,
		isUserDesktopAppUser: false
	};

	const readerSidebarDefaultProps = {
		path: '/',
	};

	useFakeDom();
	useMockery();

	before( ( ) => {
		mockery.registerMock( 'component-closest', stub() );
		shouldRenderAppPromo = require( '..' ).shouldRenderAppPromo;
		ReaderSidebar = require( '..' ).ReaderSidebar;
	} );

	context( 'AppPromo', ( ) => {

		it( 'should render the AppPromo when the shouldRenderAppPromo property is true', ( ) => {
			const adjustedProperties = { ...readerSidebarDefaultProps, shouldRenderAppPromo: true }
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 1 );
		});

		it( 'should not render the AppPromo when the shouldRenderAppPromo property is false', ( ) => {
			const adjustedProperties = { ...readerSidebarDefaultProps, shouldRenderAppPromo: false }
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.reader-sidebar__AppPromo' ) ).to.have.lengthOf( 0 );
		});

		context( 'shouldRenderAppPromo', ( ) => {
			it( 'should not render if desktop promo is disabled', ( ) => {
				expect( shouldRenderAppPromo( { ...shouldRenderAppPromoDefaultProps, isDesktopPromoDisabled: true } ) ).to.be.false;
			} );

			it( 'should not render if user locale isn\'t english', ( ) => {
				expect( shouldRenderAppPromo( { ...shouldRenderAppPromoDefaultProps, isUserLocaleEnglish: false } ) ).to.be.false;
			} );

			it( 'should not render if the viewport is mobile', ( ) => {
				expect( shouldRenderAppPromo( { ...shouldRenderAppPromoDefaultProps, isViewportMobile: true } ) ).to.be.false;
			} );

			it( 'should not render if it\'s ChromeOS', ( ) => {
				expect( shouldRenderAppPromo( { ...shouldRenderAppPromoDefaultProps, isChromeOS: true } ) ).to.be.false;
			} );

			it( 'should not render if desktop promo isn\'t configured to run', ( ) => {
				expect( shouldRenderAppPromo( { ...shouldRenderAppPromoDefaultProps, isDesktopPromoConfiguredToRun: false } ) ).to.be.false;
			} );

			it( 'should not render if user is a desktop app user', ( ) => {
				expect( shouldRenderAppPromo( { ...shouldRenderAppPromoDefaultProps, isUserDesktopAppUser: true } ) ).to.be.false;
			} );

			it( 'should render if desktop promo wasn\'t disabled by the user, the locale is english, the viewport isn\'t mobile, it\'s not ChromeOS, the desktop promo is configured to run, and the user isn\'t a desktop app user', ( ) => {
				expect( shouldRenderAppPromo( shouldRenderAppPromoDefaultProps ) ).to.be.true;
			} );
		});
	} );
} );

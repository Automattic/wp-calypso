/**
 * @format
 * @jest-environment jsdom
 */
jest.mock( 'component-closest', () => require( 'sinon' ).stub() );
jest.mock( 'lib/wp', () => ( {
	batch: () => ( {
		add: () => {},
		run: () => {},
	} ),
	me: () => ( {
		get: () => {},
	} ),
	undocumented: () => {},
} ) );

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { ReaderSidebar, shouldRenderAppPromo } from '..';

describe( 'ReaderSidebar', () => {
	const shouldRenderAppPromoDefaultProps = {
		isDesktopPromoDisabled: false,
		isUserLocaleEnglish: true,
		isViewportMobile: false,
		isUserOnChromeOs: false,
		isDesktopPromoConfiguredToRun: true,
		isUserDesktopAppUser: false,
	};

	const readerSidebarDefaultProps = {
		path: '/',
	};

	context( 'AppPromo', () => {
		it( 'should render the AppPromo when the shouldRenderAppPromo property is true', () => {
			const adjustedProperties = { ...readerSidebarDefaultProps, shouldRenderAppPromo: true };
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.sidebar__app-promo' ) ).to.have.lengthOf( 1 );
		} );

		it( 'should not render the AppPromo when the shouldRenderAppPromo property is false', () => {
			const adjustedProperties = { ...readerSidebarDefaultProps, shouldRenderAppPromo: false };
			const wrapper = shallow( <ReaderSidebar { ...adjustedProperties } /> );
			expect( wrapper.find( '.sidebar__app-promo' ) ).to.have.lengthOf( 0 );
		} );

		context( 'shouldRenderAppPromo', () => {
			it( 'should not render if desktop promo is disabled', () => {
				expect(
					shouldRenderAppPromo( {
						...shouldRenderAppPromoDefaultProps,
						isDesktopPromoDisabled: true,
					} )
				).to.be.false;
			} );

			it( "should not render if user locale isn't english", () => {
				expect(
					shouldRenderAppPromo( {
						...shouldRenderAppPromoDefaultProps,
						isUserLocaleEnglish: false,
					} )
				).to.be.false;
			} );

			it( 'should not render if the viewport is mobile', () => {
				expect(
					shouldRenderAppPromo( { ...shouldRenderAppPromoDefaultProps, isViewportMobile: true } )
				).to.be.false;
			} );

			it( "should not render if it's ChromeOS", () => {
				expect(
					shouldRenderAppPromo( { ...shouldRenderAppPromoDefaultProps, isUserOnChromeOs: true } )
				).to.be.false;
			} );

			it( "should not render if desktop promo isn't configured to run", () => {
				expect(
					shouldRenderAppPromo( {
						...shouldRenderAppPromoDefaultProps,
						isDesktopPromoConfiguredToRun: false,
					} )
				).to.be.false;
			} );

			it( 'should not render if user is a desktop app user', () => {
				expect(
					shouldRenderAppPromo( {
						...shouldRenderAppPromoDefaultProps,
						isUserDesktopAppUser: true,
					} )
				).to.be.false;
			} );

			it( "should render if desktop promo wasn't disabled by the user, the locale is english, the viewport isn't mobile, it's not ChromeOS, the desktop promo is configured to run, and the user isn't a desktop app user", () => {
				expect( shouldRenderAppPromo( shouldRenderAppPromoDefaultProps ) ).to.be.true;
			} );
		} );
	} );
} );

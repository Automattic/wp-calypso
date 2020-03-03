/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { ReaderSidebarPromo, shouldRenderAppPromo } from '../promo';

describe( 'ReaderSidebarPromo', () => {
	const shouldRenderAppPromoDefaultProps = {
		isDesktopPromoDisabled: false,
		isUserLocaleEnglish: true,
		isViewportMobile: false,
		isUserOnChromeOs: false,
		isDesktopPromoConfiguredToRun: true,
		isUserDesktopAppUser: false,
	};

	test( 'should render the AppPromo when the shouldRenderAppPromo property is true', () => {
		const adjustedProperties = { shouldRenderAppPromo: true };
		const wrapper = shallow( <ReaderSidebarPromo { ...adjustedProperties } /> );
		expect( wrapper.find( '.sidebar__app-promo' ) ).toHaveLength( 1 );
	} );

	test( 'should not render the AppPromo when the shouldRenderAppPromo property is false', () => {
		const adjustedProperties = {
			shouldRenderAppPromo: false,
		};
		const wrapper = shallow( <ReaderSidebarPromo { ...adjustedProperties } /> );
		expect( wrapper.find( '.sidebar__app-promo' ) ).toHaveLength( 0 );
	} );

	describe( 'shouldRenderAppPromo', () => {
		test( 'should not render if desktop promo is disabled', () => {
			expect(
				shouldRenderAppPromo( {
					...shouldRenderAppPromoDefaultProps,
					isDesktopPromoDisabled: true,
				} )
			).toBe( false );
		} );

		test( "should not render if user locale isn't english", () => {
			expect(
				shouldRenderAppPromo( {
					...shouldRenderAppPromoDefaultProps,
					isUserLocaleEnglish: false,
				} )
			).toBe( false );
		} );

		test( 'should not render if the viewport is mobile', () => {
			expect(
				shouldRenderAppPromo( {
					...shouldRenderAppPromoDefaultProps,
					isViewportMobile: true,
				} )
			).toBe( false );
		} );

		test( "should not render if it's ChromeOS", () => {
			expect(
				shouldRenderAppPromo( {
					...shouldRenderAppPromoDefaultProps,
					isUserOnChromeOs: true,
				} )
			).toBe( false );
		} );

		test( "should not render if desktop promo isn't configured to run", () => {
			expect(
				shouldRenderAppPromo( {
					...shouldRenderAppPromoDefaultProps,
					isDesktopPromoConfiguredToRun: false,
				} )
			).toBe( false );
		} );

		test( 'should not render if user is a desktop app user', () => {
			expect(
				shouldRenderAppPromo( {
					...shouldRenderAppPromoDefaultProps,
					isUserDesktopAppUser: true,
				} )
			).toBe( false );
		} );

		test( "should render if desktop promo wasn't disabled by the user, the locale is english, the viewport isn't mobile, it's not ChromeOS, the desktop promo is configured to run, and the user isn't a desktop app user", () => {
			expect( shouldRenderAppPromo( shouldRenderAppPromoDefaultProps ) ).toBe( true );
		} );
	} );
} );

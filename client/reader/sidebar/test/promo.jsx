/**
 * @jest-environment jsdom
 */

import userSettings from 'calypso/state/user-settings/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarPromo, shouldRenderAppPromoSidebar } from '../promo';

const initialState = {};

function renderWithRedux( ui ) {
	return renderWithProvider( ui, {
		initialState,
		reducers: {
			userSettings,
		},
	} );
}

describe( 'ReaderSidebarPromo', () => {
	const shouldRenderAppPromoSidebarDefaultProps = {
		isDesktopPromoDisabled: false,
		isUserLocaleEnglish: true,
		isViewportMobile: false,
		isUserOnChromeOs: false,
		isDesktopPromoConfiguredToRun: true,
		isUserDesktopAppUser: false,
	};

	test( 'should render the AppPromoSidebar when the shouldRenderAppPromoSidebar property is true', () => {
		const adjustedProperties = { shouldRenderAppPromoSidebar: true };
		const { container } = renderWithRedux( <ReaderSidebarPromo { ...adjustedProperties } /> );
		expect( container.firstChild ).toHaveClass( 'sidebar__app-promo' );
	} );

	test( 'should not render the AppPromoSidebar when the shouldRenderAppPromoSidebar property is false', () => {
		const adjustedProperties = { shouldRenderAppPromoSidebar: false };
		const { container } = renderWithRedux( <ReaderSidebarPromo { ...adjustedProperties } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	describe( 'shouldRenderAppPromoSidebar', () => {
		test( 'should not render if desktop promo is disabled', () => {
			expect(
				shouldRenderAppPromoSidebar( {
					...shouldRenderAppPromoSidebarDefaultProps,
					isDesktopPromoDisabled: true,
				} )
			).toBe( false );
		} );

		test( "should not render if user locale isn't english", () => {
			expect(
				shouldRenderAppPromoSidebar( {
					...shouldRenderAppPromoSidebarDefaultProps,
					isUserLocaleEnglish: false,
				} )
			).toBe( false );
		} );

		test( 'should not render if the viewport is mobile', () => {
			expect(
				shouldRenderAppPromoSidebar( {
					...shouldRenderAppPromoSidebarDefaultProps,
					isViewportMobile: true,
				} )
			).toBe( false );
		} );

		test( "should not render if it's ChromeOS", () => {
			expect(
				shouldRenderAppPromoSidebar( {
					...shouldRenderAppPromoSidebarDefaultProps,
					isUserOnChromeOs: true,
				} )
			).toBe( false );
		} );

		test( "should not render if desktop promo isn't configured to run", () => {
			expect(
				shouldRenderAppPromoSidebar( {
					...shouldRenderAppPromoSidebarDefaultProps,
					isDesktopPromoConfiguredToRun: false,
				} )
			).toBe( false );
		} );

		test( 'should not render if user is a desktop app user', () => {
			expect(
				shouldRenderAppPromoSidebar( {
					...shouldRenderAppPromoSidebarDefaultProps,
					isUserDesktopAppUser: true,
				} )
			).toBe( false );
		} );

		test( "should render if desktop promo wasn't disabled by the user, the locale is english, the viewport isn't mobile, it's not ChromeOS, the desktop promo is configured to run, and the user isn't a desktop app user", () => {
			expect( shouldRenderAppPromoSidebar( shouldRenderAppPromoSidebarDefaultProps ) ).toBe( true );
		} );
	} );
} );

/**
 * @jest-environment jsdom
 */
import {
	clearStaleBigSkySidebarSuppression,
	shouldSuppressStaleBigSkySidebar,
	suppressStaleBigSkySidebar,
} from '../suppress-stale-big-sky-sidebar';

const mockSelect = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	select: ( ...args: unknown[] ) => mockSelect( ...args ),
} ) );

function installAgentsManagerData( data: unknown ) {
	( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData = data;
}

describe( 'suppressStaleBigSkySidebar', () => {
	beforeEach( () => {
		jest.useRealTimers();
		document.documentElement.className = '';
		document.body.className = '';
		document.head.innerHTML = '';
		document.body.innerHTML = '';
		mockSelect.mockReturnValue( { getCurrentPostType: () => 'post' } );
		installAgentsManagerData( {
			sectionName: 'gutenberg',
			aiEditorialReviewEnabled: true,
			jetpackAiSidebarPreview: {
				enabled: true,
				features: { aiEditorialReview: true },
			},
		} );
	} );

	afterEach( () => {
		clearStaleBigSkySidebarSuppression();
		delete ( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData;
	} );

	it( 'suppresses Big Sky chrome in the AER post editor', () => {
		document.body.innerHTML = `
			<div class="block-editor__container big-sky-sidebar-container big-sky-sidebar-container--sidebar-open">
				<div class="big-sky-sidebar"></div>
				<button class="big-sky-sidebar__fab"></button>
			</div>
			<div id="big-sky-wp-admin-agent-root"></div>
		`;

		expect( suppressStaleBigSkySidebar() ).toBe( true );

		expect( document.documentElement.classList ).toContain(
			'agents-manager-suppress-stale-big-sky-sidebar'
		);
		expect(
			document.getElementById( 'agents-manager-suppress-stale-big-sky-sidebar-style' )
		).toBeTruthy();
		expect( document.querySelector( '.big-sky-sidebar' ) ).toHaveAttribute( 'hidden' );
		expect( document.querySelector( '.big-sky-sidebar__fab' ) ).toHaveAttribute( 'hidden' );
		expect( document.getElementById( 'big-sky-wp-admin-agent-root' ) ).toHaveAttribute( 'hidden' );
		expect( document.querySelector( '.block-editor__container' ) ).not.toHaveClass(
			'big-sky-sidebar-container'
		);
		expect( document.querySelector( '.block-editor__container' ) ).not.toHaveClass(
			'big-sky-sidebar-container--sidebar-open'
		);
	} );

	it( 'restores suppressed Big Sky chrome and layout classes on cleanup', () => {
		document.body.innerHTML = `
			<div class="block-editor__container big-sky-sidebar-container big-sky-sidebar-container--sidebar-open">
				<div class="big-sky-sidebar" aria-hidden="false"></div>
				<button class="big-sky-sidebar__fab"></button>
			</div>
		`;

		expect( suppressStaleBigSkySidebar() ).toBe( true );

		clearStaleBigSkySidebarSuppression();

		expect( document.documentElement.classList ).not.toContain(
			'agents-manager-suppress-stale-big-sky-sidebar'
		);
		expect(
			document.getElementById( 'agents-manager-suppress-stale-big-sky-sidebar-style' )
		).toBeNull();
		expect( document.querySelector( '.big-sky-sidebar' ) ).not.toHaveAttribute( 'hidden' );
		expect( document.querySelector( '.big-sky-sidebar' ) ).toHaveAttribute(
			'aria-hidden',
			'false'
		);
		expect( document.querySelector( '.big-sky-sidebar__fab' ) ).not.toHaveAttribute( 'hidden' );
		expect( document.querySelector( '.big-sky-sidebar__fab' ) ).not.toHaveAttribute(
			'aria-hidden'
		);
		expect( document.querySelector( '.block-editor__container' ) ).toHaveClass(
			'big-sky-sidebar-container'
		);
		expect( document.querySelector( '.block-editor__container' ) ).toHaveClass(
			'big-sky-sidebar-container--sidebar-open'
		);
	} );

	it( 'does not suppress outside the post editor', () => {
		mockSelect.mockReturnValue( { getCurrentPostType: () => 'page' } );
		document.body.className = 'post-type-page';

		expect( shouldSuppressStaleBigSkySidebar() ).toBe( false );
		expect( suppressStaleBigSkySidebar() ).toBe( false );
		expect( document.documentElement.classList ).not.toContain(
			'agents-manager-suppress-stale-big-sky-sidebar'
		);
	} );

	it( 'does not suppress when the Agents Manager section is missing', () => {
		installAgentsManagerData( {
			aiEditorialReviewEnabled: true,
			jetpackAiSidebarPreview: {
				enabled: true,
				features: { aiEditorialReview: true },
			},
		} );

		expect( shouldSuppressStaleBigSkySidebar() ).toBe( false );
	} );

	it( 'does not suppress on non-editor post screens when the editor store is unavailable', () => {
		mockSelect.mockImplementation( () => {
			throw new Error( 'store unavailable' );
		} );
		document.body.className = 'post-type-post edit-php';

		expect( shouldSuppressStaleBigSkySidebar() ).toBe( false );
	} );

	it( 'suppresses on post editor body classes when the editor store is unavailable', () => {
		mockSelect.mockImplementation( () => {
			throw new Error( 'store unavailable' );
		} );
		document.body.className = 'post-type-post post-php block-editor-page';

		expect( shouldSuppressStaleBigSkySidebar() ).toBe( true );
	} );

	it( 'falls back to post editor body classes when the editor store returns null', () => {
		mockSelect.mockReturnValue( { getCurrentPostType: () => null } );
		document.body.className = 'post-type-post post-php block-editor-page';

		expect( shouldSuppressStaleBigSkySidebar() ).toBe( true );
	} );

	it( 'does not suppress when Jetpack AI Sidebar preview is disabled', () => {
		installAgentsManagerData( {
			sectionName: 'gutenberg',
			aiEditorialReviewEnabled: true,
			jetpackAiSidebarPreview: { enabled: false },
		} );

		expect( shouldSuppressStaleBigSkySidebar() ).toBe( false );
	} );
} );

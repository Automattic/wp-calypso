/**
 * @jest-environment jsdom
 */
import {
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

	it( 'does not suppress outside the post editor', () => {
		mockSelect.mockReturnValue( { getCurrentPostType: () => 'page' } );
		document.body.className = 'post-type-page';

		expect( shouldSuppressStaleBigSkySidebar() ).toBe( false );
		expect( suppressStaleBigSkySidebar() ).toBe( false );
		expect( document.documentElement.classList ).not.toContain(
			'agents-manager-suppress-stale-big-sky-sidebar'
		);
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

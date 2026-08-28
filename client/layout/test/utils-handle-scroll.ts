/**
 * @jest-environment jsdom
 */
import { handleScroll, resetSidebarScrollState } from '../utils';

const MASTERBAR_HEIGHT = 46;
const VIEWPORT_HEIGHT = 600;

// jsdom performs no layout, so every measurement the code reads is 0 unless shadowed.
function stub( el: HTMLElement, values: { scrollHeight?: number; height?: number } ) {
	if ( values.scrollHeight !== undefined ) {
		Object.defineProperty( el, 'scrollHeight', { value: values.scrollHeight } );
	}
	if ( values.height !== undefined ) {
		el.getBoundingClientRect = () => ( { height: values.height } ) as DOMRect;
	}
}

function buildLayout( { sidebarHeight, contentHeight }: Record< string, number > ) {
	document.body.innerHTML =
		'<div id="wpcom-omnibar"></div><div id="secondary"></div><div id="content"></div>';

	stub( document.getElementById( 'wpcom-omnibar' ) as HTMLElement, {
		height: MASTERBAR_HEIGHT,
	} );
	stub( document.getElementById( 'secondary' ) as HTMLElement, { scrollHeight: sidebarHeight } );
	stub( document.getElementById( 'content' ) as HTMLElement, { scrollHeight: contentHeight } );
}

describe( 'handleScroll', () => {
	beforeEach( () => {
		resetSidebarScrollState();
		window.innerHeight = VIEWPORT_HEIGHT;
	} );

	it( 'grows the content so the window can scroll far enough to reach the whole sidebar', () => {
		buildLayout( { sidebarHeight: 1200, contentHeight: 400 } );

		handleScroll( { type: 'resize' } );

		expect( document.getElementById( 'content' )?.style.minHeight ).toBe(
			`${ 1200 + MASTERBAR_HEIGHT }px`
		);
	} );

	it( 'measures the omnibar when it stands in for the masterbar', () => {
		buildLayout( { sidebarHeight: 1200, contentHeight: 400 } );

		handleScroll( { type: 'resize' } );

		// Without the omnibar fallback the height would be undefined and the block skipped,
		// leaving min-height unset — the bug this suite guards.
		expect( document.getElementById( 'content' )?.style.minHeight ).not.toBe( '' );
	} );

	it( 'leaves the content alone when the sidebar already fits', () => {
		buildLayout( { sidebarHeight: 300, contentHeight: 400 } );

		handleScroll( { type: 'resize' } );

		expect( document.getElementById( 'content' )?.style.minHeight ).toBe( 'initial' );
	} );

	it( 'does nothing when no bar is rendered', () => {
		buildLayout( { sidebarHeight: 1200, contentHeight: 400 } );
		document.getElementById( 'wpcom-omnibar' )?.remove();

		handleScroll( { type: 'resize' } );

		expect( document.getElementById( 'content' )?.style.minHeight ).toBe( '' );
	} );
} );

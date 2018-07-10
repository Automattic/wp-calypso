/**
 * Internal dependencies
 */
import createElement from './utils/create-element';
import { find } from '../focusable';

describe( 'focusable', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	describe( 'find()', () => {
		it( 'returns empty array if no children', () => {
			const node = createElement( 'div' );

			expect( find( node ) ).toEqual( [] );
		} );

		it( 'returns empty array if no focusable children', () => {
			const node = createElement( 'div' );
			node.appendChild( createElement( 'div' ) );

			expect( find( node ) ).toEqual( [] );
		} );

		it( 'returns array of focusable children', () => {
			const node = createElement( 'div' );
			node.appendChild( createElement( 'input' ) );

			const focusable = find( node );

			expect( focusable ).toHaveLength( 1 );
			expect( focusable[ 0 ].nodeName ).toBe( 'INPUT' );
		} );

		it( 'finds nested focusable child', () => {
			const node = createElement( 'div' );
			node.appendChild( createElement( 'div' ) );
			node.firstChild.appendChild( createElement( 'input' ) );

			const focusable = find( node );

			expect( focusable ).toHaveLength( 1 );
			expect( focusable[ 0 ].nodeName ).toBe( 'INPUT' );
		} );

		it( 'finds link with no href but tabindex', () => {
			const node = createElement( 'div' );
			const link = createElement( 'a' );
			link.tabIndex = 0;
			node.appendChild( link );

			expect( find( node ) ).toEqual( [ link ] );
		} );

		it( 'finds valid area focusable', () => {
			const map = createElement( 'map' );
			map.name = 'testfocus';
			const area = createElement( 'area' );
			area.href = '';
			map.appendChild( area );
			const img = createElement( 'img' );
			img.setAttribute( 'usemap', '#testfocus' );
			document.body.appendChild( map );
			document.body.appendChild( img );

			const focusable = find( map );

			expect( focusable ).toHaveLength( 1 );
			expect( focusable[ 0 ].nodeName ).toBe( 'AREA' );
		} );

		it( 'ignores invalid area focusable', () => {
			const map = createElement( 'map' );
			map.name = 'testfocus';
			const area = createElement( 'area' );
			area.href = '';
			map.appendChild( area );
			const img = createElement( 'img' );
			img.setAttribute( 'usemap', '#testfocus' );
			img.style.display = 'none';
			document.body.appendChild( map );
			document.body.appendChild( img );

			expect( find( map ) ).toEqual( [] );
		} );

		it( 'finds contenteditable', () => {
			const node = createElement( 'div' );
			const div = createElement( 'div' );
			node.appendChild( div );

			div.setAttribute( 'contenteditable', '' );
			expect( find( node ) ).toEqual( [ div ] );

			div.setAttribute( 'contenteditable', 'true' );
			expect( find( node ) ).toEqual( [ div ] );
		} );

		it( 'ignores contenteditable=false', () => {
			const node = createElement( 'div' );
			const div = createElement( 'div' );
			node.appendChild( div );

			div.setAttribute( 'contenteditable', 'false' );
			expect( find( node ) ).toEqual( [] );
		} );

		it( 'ignores invisible inputs', () => {
			const node = createElement( 'div' );
			const input = createElement( 'input' );
			node.appendChild( input );

			input.style.visibility = 'hidden';
			expect( find( node ) ).toEqual( [] );

			input.style.visibility = 'visible';
			input.style.display = 'none';
			expect( find( node ) ).toEqual( [] );

			input.style.display = 'inline-block';
			const focusable = find( node );
			expect( focusable ).toHaveLength( 1 );
			expect( focusable[ 0 ].nodeName ).toBe( 'INPUT' );
		} );

		it( 'ignores inputs in invisible ancestors', () => {
			const node = createElement( 'div' );
			const input = createElement( 'input' );
			node.appendChild( input );

			node.style.visibility = 'hidden';
			expect( find( node ) ).toEqual( [] );

			node.style.visibility = 'visible';
			node.style.display = 'none';
			expect( find( node ) ).toEqual( [] );

			node.style.display = 'block';
			const focusable = find( node );
			expect( focusable ).toHaveLength( 1 );
			expect( focusable[ 0 ].nodeName ).toBe( 'INPUT' );
		} );

		it( 'does not return context even if focusable', () => {
			const node = createElement( 'div' );
			node.tabIndex = 0;

			expect( find( node ) ).toEqual( [] );
		} );

		it( 'limits found focusables to specific context', () => {
			const node = createElement( 'div' );
			node.appendChild( createElement( 'div' ) );
			document.body.appendChild( node );
			document.body.appendChild( createElement( 'input' ) );

			expect( find( node ) ).toEqual( [] );
		} );
	} );
} );

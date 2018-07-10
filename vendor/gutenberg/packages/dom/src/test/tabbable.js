/**
 * Internal dependencies
 */
import createElement from './utils/create-element';
import { find } from '../tabbable';

describe( 'tabbable', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	describe( 'find()', () => {
		it( 'returns focusables in order of tabindex', () => {
			const node = createElement( 'div' );
			const absent = createElement( 'input' );
			absent.tabIndex = -1;
			const first = createElement( 'input' );
			const second = createElement( 'span' );
			second.tabIndex = 0;
			const third = createElement( 'input' );
			third.tabIndex = 1;
			node.appendChild( third );
			node.appendChild( first );
			node.appendChild( second );
			node.appendChild( absent );

			const tabbables = find( node );

			expect( tabbables ).toEqual( [
				first,
				second,
				third,
			] );
		} );
	} );
} );

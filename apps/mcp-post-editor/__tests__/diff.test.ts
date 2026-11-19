/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { diffWords, textOf } from '../editor/diff';

describe( 'diffWords', () => {
	it( 'marks the words removed and added between the shared ones', () => {
		expect( diffWords( 'The ovens start at four.', 'The big ovens start at five.' ) ).toEqual( [
			{ type: 'same', text: 'The' },
			{ type: 'added', text: 'big' },
			{ type: 'same', text: 'ovens start at' },
			{ type: 'removed', text: 'four.' },
			{ type: 'added', text: 'five.' },
		] );
	} );

	it( 'returns nothing for two empty texts', () => {
		expect( diffWords( '', ' ' ) ).toEqual( [] );
	} );
} );

describe( 'textOf', () => {
	it( 'reads the words of block markup, one item apart from the next', () => {
		expect(
			textOf(
				'<!-- wp:list -->\n<ul><li>Sour<strong>dough</strong></li><li>Rye</li></ul>\n<!-- /wp:list -->'
			)
		).toBe( 'Sourdough Rye' );
	} );

	it( 'runs nothing in the markup', () => {
		const run = window as unknown as { run?: boolean };
		textOf( '<p><img src="x" onerror="window.run = true">Hi</p>' );
		expect( run.run ).toBeUndefined();
	} );
} );

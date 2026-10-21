// eslint-disable-next-line import/no-nodejs-modules
import { readFileSync } from 'node:fs';
import postcss, { type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';

// Reads the source rule. jsdom resolves neither var() nor selector weight, and vitest stubs `?raw` CSS.
const css = readFileSync( new URL( './Notice.module.css', import.meta.url ), 'utf8' );

const colorOf = ( rule: Rule ) => {
	let color: string | undefined;
	rule.each( ( node ) => {
		if ( node.type === 'decl' && node.prop === 'color' ) {
			color = node.value.replace( /\s+/g, '' );
		}
	} );
	return color;
};

describe( 'Notice action styles', () => {
	it( 'keeps the action color on focus and press, above host `a:focus` and `a:active` rules', () => {
		let restColor: string | undefined;
		const rules: { states: string[]; color?: string }[] = [];
		postcss.parse( css ).walkRules( ( rule ) => {
			if ( rule.selector === '.action' ) {
				restColor = colorOf( rule );
			} else if ( rule.selector.startsWith( '.action:is(' ) ) {
				const states = rule.selector.replace( /^\.action:is\((.*)\)$/, '$1' ).split( ',' );
				rules.push( { states: states.map( ( state ) => state.trim() ), color: colorOf( rule ) } );
			}
		} );

		expect( restColor ).toBeDefined();
		expect( rules ).toContainEqual( {
			states: expect.arrayContaining( [ ':focus', ':active' ] ),
			color: restColor,
		} );
	} );
} );

// eslint-disable-next-line import/no-nodejs-modules
import { readFileSync } from 'node:fs';
import postcss, { type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';

// Reads the source rules. jsdom resolves neither var() nor selector weight, and the
// order the two CSS modules load in is not fixed, so the override has to win on weight.
const read = ( file: string ) => readFileSync( new URL( file, import.meta.url ), 'utf8' );

const declsOf = ( rule: Rule ) => {
	const decls: Record< string, string > = {};
	rule.each( ( node ) => {
		if ( node.type === 'decl' ) {
			decls[ node.prop ] = node.value.replace( /\s+/g, '' );
		}
	} );
	return decls;
};

const classCount = ( selector: string ) => selector.match( /\.[\w-]+/g )?.length ?? 0;

describe( 'Messages error notice styles', () => {
	it( 'drops the above-composer margin and square bottom corners, outweighing the notice container rule', () => {
		const noticeRules: Rule[] = [];
		postcss.parse( read( './Notice.module.css' ) ).walkRules( '.container', ( rule ) => {
			noticeRules.push( rule );
		} );
		const overrides: Rule[] = [];
		postcss.parse( read( './Messages.module.css' ) ).walkRules( ( rule ) => {
			if ( rule.selector.endsWith( '.errorNotice' ) ) {
				overrides.push( rule );
			}
		} );

		expect( noticeRules ).toHaveLength( 1 );
		expect( overrides ).toHaveLength( 1 );
		expect( classCount( overrides[ 0 ].selector ) ).toBeGreaterThan(
			classCount( noticeRules[ 0 ].selector )
		);
		expect( declsOf( overrides[ 0 ] ) ).toEqual( {
			margin: '0',
			'border-radius': 'var(--radius-lg)',
		} );
	} );
} );

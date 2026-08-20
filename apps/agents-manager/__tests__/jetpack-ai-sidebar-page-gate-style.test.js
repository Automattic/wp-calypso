/**
 * @jest-environment node
 */

const path = require( 'path' );
const postcss = require( 'postcss' );
const sass = require( 'sass' );

describe( 'Jetpack AI sidebar page gate CSS', () => {
	it( 'overrides the server-rendered admin-bar Ask AI button', () => {
		const file = path.resolve( __dirname, '../jetpack-ai-sidebar-page-gate.scss' );
		const css = postcss.parse( sass.compile( file ).css );
		let matchedDeclaration;

		css.walkRules( ( rule ) => {
			if ( rule.selector.includes( '#wp-admin-bar-agents-manager-ai-chat' ) ) {
				rule.walkDecls( 'display', ( declaration ) => {
					matchedDeclaration = declaration;
				} );
			}
		} );

		expect( matchedDeclaration?.value ).toBe( 'none' );
		expect( matchedDeclaration?.important ).toBe( true );
	} );
} );

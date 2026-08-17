/**
 * @jest-environment node
 */

const path = require( 'path' );
const postcss = require( 'postcss' );
const sass = require( 'sass' );

describe( 'Resolved edit action CSS contract', () => {
	it( 'keeps icon paths on the surrounding action color', () => {
		const stylesheet = path.resolve(
			__dirname,
			'../../../packages/agents-manager/src/components/agent-dock/style.scss'
		);
		const css = postcss.parse(
			sass.compile( stylesheet, {
				loadPaths: [ path.resolve( __dirname, '../../../node_modules' ) ],
			} ).css
		);
		const selector = /\.agents-manager-resolved-edit-action__icon path$/;
		const declarations = new Map();

		css.walkRules( selector, ( rule ) => {
			rule.walkDecls( ( declaration ) => {
				declarations.set( declaration.prop, declaration.value );
			} );
		} );

		expect( declarations.get( 'color' ) ).toBe( 'inherit' );
		expect( declarations.get( 'fill' ) ).toBe( 'currentColor' );
	} );
} );

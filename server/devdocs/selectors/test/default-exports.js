/**
 * External dependencies
 */
import espree from 'espree';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { defaultFunction } from '../default-exports';

const name = 'foo';

const ast = contents => espree.parse( contents, {
	attachComment: true,
	ecmaVersion: 6,
	sourceType: 'module',
	ecmaFeatures: {
		experimentalObjectRestSpread: true,
	}
} );

const parse = s => defaultFunction( ast( s ) );

const pass = s => expect( parse( s ) ).to.satisfy( node => (
		node &&
		( node.id && node.id.name === name ) ||
		( node.declaration && node.declaration.id && node.declaration.id.name === name ) ||
		( node.declaration && node.declaration.type === 'ArrowFunctionExpression' ) ||
		( node.type === 'VariableDeclaration' && node.declarations && node.declarations[ 0 ].id.name === name )
	) );

const fail = s => expect( parse( s ) ).to.be.null;

describe( 'defaultFunction', () => {
	it( 'should find exported function declaration', () => {
		pass( `export default function ${ name }() {}` );
		pass( 'export default () => {}' );
	} );

	it( 'should find referenced functions', () => {
		pass( `function ${ name }() {}\nexport default ${ name }` );
		pass( `const ${ name } = function() {}\nexport default ${ name }` );
		pass( `const ${ name } = function ${ name }() {}\nexport default ${ name }` );
		pass( `const ${ name } = () => {}\nexport default ${ name }` );
	} );

	it( 'should find partially-applied functions', () => {
		pass( `function ${ name }() { return () => {} }\nexport default ${ name }()` );
		pass( `const ${ name } = () => () => {}\nexport default ${ name }()` );
	} );

	it( 'should find referenced calls', () => {
		pass( `const ${ name } = helper()\nexport default ${ name }` );
		pass( `var ${ name } = (()=>{})()\nexport default ${ name }` );
	} );

	it( 'should reject exported constants', () => {
		fail( 'export default 14' );
		fail( 'export default "test"' );
	} );

	it( 'should reject referenced constants', () => {
		fail( `const ${ name } = 42\nexport default ${ name }` );
		fail( `var ${ name } = 'test'\nexport default ${ name }` );
	} );
} );

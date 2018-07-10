/**
 * External dependencies
 */
import { transformSync } from '@babel/core';

/**
 * Internal dependencies
 */
import plugin from '../src';

describe( 'babel-plugin-import-jsx-pragma', () => {
	function getTransformedCode( source, options = {} ) {
		const { code } = transformSync( source, {
			configFile: false,
			plugins: [
				[ plugin, options ],
				'@babel/plugin-syntax-jsx',
			],
		} );

		return code;
	}

	it( 'does nothing if there is no jsx', () => {
		const original = 'let foo;';
		const string = getTransformedCode( original );

		expect( string ).toBe( original );
	} );

	it( 'does nothing if there scope variable already imported', () => {
		const original = 'import React from "react";\nlet foo = <bar />;';
		const string = getTransformedCode( original );

		expect( string ).toBe( original );
	} );

	it( 'adds import for scope variable', () => {
		const original = 'let foo = <bar />;';
		const string = getTransformedCode( original );

		expect( string ).toBe( 'import React from "react";\nlet foo = <bar />;' );
	} );

	it( 'allows options customization', () => {
		const original = 'let foo = <bar />;';
		const string = getTransformedCode( original, {
			scopeVariable: 'createElement',
			source: '@wordpress/element',
			isDefault: false,
		} );

		expect( string ).toBe( 'import { createElement } from "@wordpress/element";\nlet foo = <bar />;' );
	} );
} );

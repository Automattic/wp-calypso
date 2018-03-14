/** @format */

/**
 * External dependencies
 */
const babel = require( '@babel/core' );

describe( 'babel-lodash-es', () => {
	function transform( code ) {
		return babel
			.transform( code, {
				plugins: [ require( '..' ) ],
			} )
			.code.replace( /\"/g, "'" );
	}

	test( 'should transform named import from top-level package', () => {
		const code = transform( "import { get } from 'lodash-es';" );
		expect( code ).toBe( "import { get } from 'lodash';" );
	} );

	test( 'should transform default import from top-level package', () => {
		const code = transform( "import _ from 'lodash-es';" );
		expect( code ).toBe( "import _ from 'lodash';" );
	} );

	test( 'should transform default import from a submodule', () => {
		const code = transform( "import get from 'lodash-es/get'" );
		expect( code ).toBe( "import { get } from 'lodash';" );
	} );

	test( 'should transform aliased default import from a submodule', () => {
		const code = transform( "import theGet from 'lodash-es/get';" );
		expect( code ).toBe( "import { get as theGet } from 'lodash';" );
	} );

	test( 'should report error on a non-default import from a submodule', () => {
		const code = "import { get } from 'lodash-es/get'";
		expect( () => transform( code ) ).toThrow( /Could not transform a non-default import/ );
	} );
} );

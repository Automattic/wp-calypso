/** @format */

/**
 * External dependencies
 */
const babel = require( 'babel-core' );

describe( 'babel-lodash-es', () => {
	function transform( code ) {
		return babel.transform( code, {
			plugins: [ require( '..' ) ],
		} ).code;
	}

	test( 'should transform named import from top-level package', () => {
		const code = "import { get } from 'lodash-es'";
		expect( transform( code ) ).toMatchSnapshot();
	} );

	test( 'should transform default import from top-level package', () => {
		const code = "import _ from 'lodash-es'";
		expect( transform( code ) ).toMatchSnapshot();
	} );

	test( 'should transform default import from a submodule', () => {
		const code = "import get from 'lodash-es/get'";
		expect( transform( code ) ).toMatchSnapshot();
	} );

	test( 'should transform aliased default import from a submodule', () => {
		const code = "import theGet from 'lodash-es/get'";
		expect( transform( code ) ).toMatchSnapshot();
	} );

	test( 'should report error on a non-default import from a submodule', () => {
		const code = "import { get } from 'lodash-es/get'";
		expect( () => transform( code ) ).toThrowErrorMatchingSnapshot();
	} );
} );

/**
 * @file Disallow importing lodash
 * @author Automattic
 * @copyright 2026 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const rule = require( '../../../lib/rules/no-import-lodash' );

// TypeScript-only syntax (`import x = require( … )`) needs the TS parser.
const tsParser = require.resolve( '@typescript-eslint/parser' );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const message =
	'lodash has been removed from this codebase — do not add new lodash imports. Use native ' +
	'JavaScript or a helper from `@automattic/js-utils` (see docs/coding-guidelines/javascript.md).';
const errors = [ { message } ];

const ruleTester = new RuleTester( {
	parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
} );

ruleTester.run( 'no-import-lodash', rule, {
	valid: [
		// Unrelated names that merely begin with "lodash" must not be flagged.
		"import x from 'lodashy';",
		"import x from 'my-lodash';",
		// A dynamic (non-static) source cannot be checked, so it is not reported.
		'import( someVariable );',
		'require( someVariable );',
		// `require.resolve` resolves a module path without importing lodash, so it
		// is out of scope (build tooling uses it, e.g. `require.resolve( 'lodash/lodash.js' )`).
		"require.resolve( 'lodash' );",
		"require.resolve( 'lodash/lodash.js' );",
	],

	invalid: [
		{ code: "import _ from 'lodash';", errors },
		{ code: "import map from 'lodash/map';", errors },
		{ code: "import merge from 'lodash.merge';", errors },
		{ code: "import * as _ from 'lodash';", errors },
		{ code: "export { map } from 'lodash/map';", errors },
		{ code: "export * from 'lodash';", errors },
		{ code: "const p = import( 'lodash/map' );", errors },
		{ code: "const _ = require( 'lodash' );", errors },
		{ code: 'const _ = require( `lodash` );', errors },
		{ code: "const mw = require( 'lodash.mergewith' );", errors },
		// `lodash-es` is covered in every import shape too.
		{ code: "import { map } from 'lodash-es';", errors },
		{ code: "import map from 'lodash-es/map';", errors },
		{ code: "export { map } from 'lodash-es';", errors },
		{ code: "export * from 'lodash-es';", errors },
		{ code: "const p = import( 'lodash-es' );", errors },
		{ code: "const _ = require( 'lodash-es' );", errors },
		{ code: "const map = require( 'lodash-es/map' );", errors },
		// TypeScript `import =` (`import x = require( … )`).
		{ code: "import _ = require( 'lodash' );", parser: tsParser, errors },
		{ code: "import _ = require( 'lodash-es' );", parser: tsParser, errors },
		// TypeScript import-type query (`type X = import( … ).Foo`).
		{ code: "type X = import( 'lodash' ).LoDashStatic;", parser: tsParser, errors },
		{ code: "type X = import( 'lodash-es' ).LoDashStatic;", parser: tsParser, errors },
	],
} );

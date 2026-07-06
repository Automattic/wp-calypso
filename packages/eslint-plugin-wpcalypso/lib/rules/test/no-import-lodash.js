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
		// The allowed replacement and unrelated names must not be flagged.
		"import { map } from 'lodash-es';",
		"import map from 'lodash-es/map';",
		"export { map } from 'lodash-es';",
		"const map = require( 'lodash-es/map' );",
		"import x from 'lodashy';",
		"import x from 'my-lodash';",
		// A dynamic (non-static) source cannot be checked, so it is not reported.
		'import( someVariable );',
		'require( someVariable );',
		// `require.resolve` resolves a module path without importing lodash, so it
		// is out of scope (build tooling uses it, e.g. `require.resolve( 'lodash/lodash.js' )`).
		"require.resolve( 'lodash' );",
		"require.resolve( 'lodash/lodash.js' );",
		// TypeScript `import =` targeting the allowed replacement.
		{ code: "import _ = require( 'lodash-es' );", parser: tsParser },
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
		// TypeScript `import =` (`import x = require( … )`).
		{ code: "import _ = require( 'lodash' );", parser: tsParser, errors },
		// TypeScript import-type query (`type X = import( … ).Foo`).
		{ code: "type X = import( 'lodash' ).LoDashStatic;", parser: tsParser, errors },
	],
} );

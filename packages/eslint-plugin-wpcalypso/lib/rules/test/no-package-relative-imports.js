/**
 * @file Forbid package-relative imports
 * @author Automattic
 * @copyright 2020 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../no-package-relative-imports' );
const RuleTester = require( 'eslint' ).RuleTester;
const path = require( 'path' );
const fs = require( 'fs' );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const calypsoDir = path.join( __dirname, '../../../../../client' );
const options = [
	{
		mapping: [
			{
				dir: calypsoDir,
				module: 'wp-calypso',
			},
		],
		warnOnDynamicImport: true,
	},
];

new RuleTester( {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
} ).run( 'no-package-relative-imports', rule, {
	valid: [
		{ code: `import config from 'wp-calypso/config';`, options },
		{ code: "import * as stats from 'wp-calypso/reader/stats';", options },
		{ code: "import { localizeUrl } from 'wp-calypso/lib/i18n-utils';", options },
		{
			code:
				"export { default as ActionCard } from 'wp-calypso/components/action-card/docs/example';",
			options,
		},
		{ code: "export * from 'wp-calypso/components/AppBar';", options },
		{ code: "const config = require('wp-calypso/config');", options },
		{ code: "import config from './config';", options },
		{ code: "import config from '../../../config';", options },
		{ code: "import config from 'random-directory';", options },
	],

	invalid: [
		{
			code: `import config from 'config';`,
			options,
			errors: [
				{
					message: `Import config relative to \`${ calypsoDir }\` is not allowed`,
					type: 'ImportDeclaration',
				},
			],
			output: `import config from 'wp-calypso/config';`,
		},
		{
			code: `import * as stats from 'reader/stats';`,
			options,
			errors: [
				{
					message: `Import reader/stats relative to \`${ calypsoDir }\` is not allowed`,
					type: 'ImportDeclaration',
				},
			],
			output: `import * as stats from 'wp-calypso/reader/stats';`,
		},
		{
			code: `import { localizeUrl } from 'lib/i18n-utils';`,
			options,
			errors: [
				{
					message: `Import lib/i18n-utils relative to \`${ calypsoDir }\` is not allowed`,
					type: 'ImportDeclaration',
				},
			],
			output: `import { localizeUrl } from 'wp-calypso/lib/i18n-utils';`,
		},
		{
			code: `export { default as ActionCard } from 'components/action-card/docs/example';`,
			options,
			errors: [
				{
					message: `Import components/action-card/docs/example relative to \`${ calypsoDir }\` is not allowed`,
					type: 'ExportNamedDeclaration',
				},
			],
			output: `export { default as ActionCard } from 'wp-calypso/components/action-card/docs/example';`,
		},
		{
			code: `export * from 'components/AppBar';`,
			options,
			errors: [
				{
					message: `Import components/AppBar relative to \`${ calypsoDir }\` is not allowed`,
					type: 'ExportAllDeclaration',
				},
			],
			output: `export * from 'wp-calypso/components/AppBar';`,
		},
		{
			code: `const config = require('config');`,
			options,
			errors: [
				{
					message: `Import config relative to \`${ calypsoDir }\` is not allowed`,
					type: 'CallExpression',
				},
			],
			output: `const config = require('wp-calypso/config');`,
		},

		// Dynamic test: test the rule with each subdirectory and file inside `./client`
		...fs
			.readdirSync( calypsoDir, { withFileTypes: true } )
			.map( ( file ) => {
				const fileName = file.name;
				if ( file.isDirectory() ) return fileName;
				const extension = path.extname( fileName );
				if ( extension !== '.js' ) return fileName;
				return path.basename( fileName, extension );
			} )
			.map( ( dir ) => ( {
				code: `import * as foo from '${ dir }';`,
				options,
				errors: [
					{
						message: `Import ${ dir } relative to \`${ calypsoDir }\` is not allowed`,
						type: 'ImportDeclaration',
					},
				],
				output: `import * as foo from 'wp-calypso/${ dir }';`,
			} ) ),
	],
} );

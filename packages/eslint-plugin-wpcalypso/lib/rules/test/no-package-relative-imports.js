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
const automaticExtensions = [ '.js', '.json', '.node', '.ts' ];
const options = [
	{
		mappings: [
			{
				dir: calypsoDir,
				module: 'wp-calypso-client',
			},
		],
		automaticExtensions,
		warnOnNonLiteralImport: true,
	},
];

new RuleTester( {
	parser: require.resolve( 'babel-eslint' ),
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
} ).run( 'no-package-relative-imports', rule, {
	valid: [
		{ code: `import config from 'wp-calypso-client/config';`, options },
		{ code: "import * as stats from 'wp-calypso-client/reader/stats';", options },
		{ code: "import { localizeUrl } from 'wp-calypso-client/lib/i18n-utils';", options },
		{
			code:
				"export { default as ActionCard } from 'wp-calypso-client/components/action-card/docs/example';",
			options,
		},
		{ code: "export * from 'wp-calypso-client/components/AppBar';", options },
		{ code: "const config = require('wp-calypso-client/config');", options },
		{ code: "const config = asyncRequire('wp-calypso-client/config');", options },
		{ code: "const getConfig = async () => await import('wp-calypso-client/config');", options },
		{ code: "const component = <AsyncLoad require='wp-calypso-client/config'/>", options },
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
			output: `import config from 'wp-calypso-client/config';`,
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
			output: `import * as stats from 'wp-calypso-client/reader/stats';`,
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
			output: `import { localizeUrl } from 'wp-calypso-client/lib/i18n-utils';`,
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
			output: `export { default as ActionCard } from 'wp-calypso-client/components/action-card/docs/example';`,
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
			output: `export * from 'wp-calypso-client/components/AppBar';`,
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
			output: `const config = require('wp-calypso-client/config');`,
		},
		{
			code: `const config = asyncRequire('config');`,
			options,
			errors: [
				{
					message: `Import config relative to \`${ calypsoDir }\` is not allowed`,
					type: 'CallExpression',
				},
			],
			output: `const config = asyncRequire('wp-calypso-client/config');`,
		},
		{
			code: `const config = async () => await import('config');`,
			options,
			errors: [
				{
					message: `Import config relative to \`${ calypsoDir }\` is not allowed`,
					type: 'ImportExpression',
				},
			],
			output: `const config = async () => await import('wp-calypso-client/config');`,
		},
		{
			code: `const component = <AsyncLoad require="config"/>`,
			options,
			errors: [
				{
					message: `Import config relative to \`${ calypsoDir }\` is not allowed`,
					type: 'JSXElement',
				},
			],
			output: `const component = <AsyncLoad require="wp-calypso-client/config"/>`,
		},

		// Dynamic test: test the rule with each subdirectory and file inside `./client`
		...fs
			.readdirSync( calypsoDir, { withFileTypes: true } )
			// Filter out files that start with a dot (like .eslintrc)
			.filter( ( file ) => ! file.name.startsWith( '.' ) )
			.map( ( file ) => {
				const fileName = file.name;
				// If it is a directory, return the name to import it directly (eg: state)
				if ( file.isDirectory() ) return fileName;

				// If the file ends in one of the automatic extensions, just return the name (eg: index.ts -> index)
				const extension = path.extname( fileName );
				if ( automaticExtensions.includes( extension ) ) {
					return path.basename( fileName, extension );
				}
				return fileName;
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
				output: `import * as foo from 'wp-calypso-client/${ dir }';`,
			} ) ),
	],
} );

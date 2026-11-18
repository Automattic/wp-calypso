/**
 * @vitest-environment node
 */
import path from 'node:path';
import { RuleTester } from 'eslint';
import plugin from '../index.mjs';

const dashboardDir = path.resolve( import.meta.dirname, '../..' );
const testFile = ( folder: string ) => path.join( dashboardDir, folder, 'test/example.test.js' );

const ruleTester = new RuleTester( {
	languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
} );

ruleTester.run( 'no-banned-module-mocks', plugin.rules![ 'no-banned-module-mocks' ], {
	valid: [
		"vi.mock( '@wordpress/data' );",
		"vi.mock( '@automattic/api-core-next' );",
		"vi.mock( '@wordpress/i18n-tools' );",
		"vi.mock( '@tanstack/react-query-persist-client' );",
		'vi.mock( moduleName );',
	],
	invalid: [
		{
			code: "vi.mock( '@automattic/api-core' );",
			errors: [ { messageId: 'apiCoreMock' } ],
		},
		{
			code: "vi.mock( '@automattic/api-core/src/site-scan' );",
			errors: [ { messageId: 'apiCoreMock' } ],
		},
		{
			code: "vi.doMock( import( '@automattic/api-core' ) );",
			errors: [ { messageId: 'apiCoreMock' } ],
		},
		{
			code: 'vi.mock( `@automattic/api-core` );',
			errors: [ { messageId: 'apiCoreMock' } ],
		},
		{
			code: "vi.importMock( '@wordpress/i18n' );",
			errors: [ { messageId: 'i18nMock' } ],
		},
		{
			code: "vi.mock( '@tanstack/react-query' );",
			errors: [ { messageId: 'queryMock', data: { module: '@tanstack/react-query' } } ],
		},
		{
			code: "vi.mock( '@automattic/api-queries' );",
			errors: [ { messageId: 'queryMock', data: { module: '@automattic/api-queries' } } ],
		},
	],
} );

ruleTester.run( 'no-router-mocks', plugin.rules![ 'no-router-mocks' ], {
	valid: [
		{ code: "vi.mock( '@tanstack/react-router-devtools' );", filename: testFile( 'app' ) },
		{
			code: "vi.mock( '../../components/router-link-button' );",
			filename: testFile( 'app' ),
		},
		{
			code: "vi.mock( '../../../utils/is-dashboard-backport' );",
			filename: testFile( 'app/router' ),
		},
	],
	invalid: [
		{ code: "vi.mock( '@tanstack/react-router' );", filename: testFile( 'app' ) },
		{ code: "vi.mock( '../router' );", filename: testFile( 'app' ) },
		{ code: "vi.mock( '../../app/router/sites' );", filename: testFile( 'domains' ) },
		{ code: "vi.mock( '../sites' );", filename: testFile( 'app/router' ) },
		{ code: "vi.mock( 'calypso/dashboard/app/router/sites' );", filename: testFile( 'sites' ) },
	].map( ( test ) => ( { ...test, errors: [ { messageId: 'routerMock' } ] } ) ),
} );

ruleTester.run( 'no-skipped-test-file', plugin.rules![ 'no-skipped-test-file' ], {
	valid: [
		'export const fixture = { ID: 1 };',
		'const it = [ 1 ][ Symbol.iterator ](); export const first = it.next().value;',
		'function test() {} test();',
	],
	invalid: [
		"describe( 'a', () => { test( 'b', () => {} ); test( 'c', () => {} ); } );",
		"test.concurrent.each( [ 1 ] )( 'case %s', () => {} );",
		"test.each`a\n${ 1 }`( 'case $a', () => {} );",
		"it.skip( 'x', () => {} );",
		"import { test } from 'vitest'; test( 'x', () => {} );",
	].map( ( code ) => ( { code, errors: [ { messageId: 'skipped' } ] } ) ),
} );

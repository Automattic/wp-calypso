/**
 * Internal dependencies
 */
import loader from '../sections-loader';
const addModuleImportToSections = loader.addModuleImportToSections;

describe( '#addModuleImportToSections', () => {
	test( 'should insert a load fn to each section using import() by default', () => {
		const sections = [
			{
				name: 'moduleName',
				module: 'module-to-require',
			},
		];

		const expected = `export default [
	{
		"name": "moduleName",
		"module": "module-to-require",
		"load": () => import( /* webpackChunkName: 'moduleName' */ 'module-to-require' )
	}
]`;

		expect( addModuleImportToSections( sections ) ).toBe( expected );
	} );

	test( 'should insert a load fn to a section using require() if useRequire is true', () => {
		const sections = [
			{
				name: 'moduleName',
				module: 'module-to-require',
			},
		];

		const expected = `export default [
	{
		"name": "moduleName",
		"module": "module-to-require",
		"load": () => require( 'module-to-require' )
	}
]`;

		const options = { useRequire: true };
		expect( addModuleImportToSections( sections, options ) ).toBe( expected );
	} );

	test( 'should insert a load fn exclusively to isomorphic sections if onlyIsomorphic is enabled', () => {
		const sections = [
			{
				name: 'moduleName',
				module: 'module-to-require',
			},
			{
				name: 'moduleName2',
				module: 'module-to-require',
				isomorphic: true,
			},
			{
				name: 'moduleName3',
				module: 'module-to-require',
			},
		];

		const expected = `export default [
	{
		"name": "moduleName",
		"module": "module-to-require"
	},
	{
		"name": "moduleName2",
		"module": "module-to-require",
		"isomorphic": true,
		"load": () => require( 'module-to-require' )
	},
	{
		"name": "moduleName3",
		"module": "module-to-require"
	}
]`;

		const options = { useRequire: true, onlyIsomorphic: true };
		expect( addModuleImportToSections( sections, options ) ).toBe( expected );
	} );
} );

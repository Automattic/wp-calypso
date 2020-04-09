/**
 * Internal dependencies
 */
import loader from '../sections-loader';
const addModuleImportToSections = loader.addModuleImportToSections;

describe( '#addModuleImportToSections', () => {
	test( 'should insert a load fn to each section using import() if code splitting is turned on', () => {
		const sections = [
			{
				name: 'moduleName',
				module: 'module-to-require',
			},
		];

		const expected = `module.exports = [
	{
		"name": "moduleName",
		"module": "module-to-require",
		"load": function() { return import( /* webpackChunkName: 'moduleName' */ 'module-to-require'); }
	}
]`;
		const options = { sections, shouldSplit: true, onlyIsomorphic: false };
		expect( addModuleImportToSections( options ) ).toBe( expected );
	} );

	test( 'should insert a load fn to a section using require() if code splitting is turned off', () => {
		const sections = [
			{
				name: 'moduleName',
				module: 'module-to-require',
			},
		];

		const expected = `module.exports = [
	{
		"name": "moduleName",
		"module": "module-to-require",
		"load": function() { return require( /* webpackChunkName: 'moduleName' */ 'module-to-require'); }
	}
]`;
		const options = { sections, shouldSplit: false, onlyIsomorphic: false };
		expect( addModuleImportToSections( options ) ).toBe( expected );
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

		const expected = `module.exports = [
	{
		"name": "moduleName",
		"module": "module-to-require"
	},
	{
		"name": "moduleName2",
		"module": "module-to-require",
		"isomorphic": true,
		"load": function() { return require( /* webpackChunkName: 'moduleName2' */ 'module-to-require'); }
	},
	{
		"name": "moduleName3",
		"module": "module-to-require"
	}
]`;
		const options = { sections, shouldSplit: false, onlyIsomorphic: true };
		expect( addModuleImportToSections( options ) ).toBe( expected );
	} );
} );

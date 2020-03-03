const mockFs = require( 'mock-fs' );
const { candidates, simplify, effectiveTree } = require( '../index' );

describe( 'Candidate generation', () => {
	it( 'Traverses the path', () => {
		const paths = Array.from( candidates( 'a/node_modules/b/node_modules/c' ) );
		expect( paths ).toStrictEqual( [
			'a/node_modules/b/node_modules/c/node_modules',
			'a/node_modules/b/node_modules',
			'a/node_modules',
			'node_modules',
		] );
	} );
} );

describe( 'Simplify tree', () => {
	it( 'Basic simplification', () => {
		const tree = {
			name: 'foo',
			path: 'node_modules/bar/node_modules/foo',
			version: '1.0.0',
			linkedDeps: [
				{
					name: 'bar',
					path: 'node_modules/bar',
					version: '2.0.0',
				},
			],
		};
		expect( simplify( tree, [] ) ).toStrictEqual( { 'foo@1.0.0': { 'bar@2.0.0': {} } } );
	} );

	it( 'Skips missing dependencies', () => {
		const tree = {
			name: 'foo',
			path: 'node_modules/bar/node_modules/foo',
			version: '1.0.0',
			linkedDeps: [ null ],
		};

		expect( simplify( tree, [] ) ).toStrictEqual( { 'foo@1.0.0': {} } );
	} );

	it( 'Detects circular dependencies', () => {
		const packageFoo = {
			name: 'foo',
			path: 'node_modules/bar/node_modules/foo',
			version: '1.0.0',
			linkedDeps: [],
		};
		const packageBar = {
			name: 'bar',
			path: 'node_modules/bar',
			version: '2.0.0',
			linkedDeps: [],
		};
		packageFoo.linkedDeps.push( packageBar );
		packageBar.linkedDeps.push( packageFoo );

		expect( simplify( packageFoo, [] ) ).toStrictEqual( {
			'foo@1.0.0': { 'bar@2.0.0': { 'foo@1.0.0': '[Circular]' } },
		} );
	} );
} );

describe( 'Effective tree generation', () => {
	beforeEach( () => {
		mockFs( {
			'package.json': JSON.stringify( {
				name: 'root',
				version: '1.0.0',
				dependencies: {
					a: '^1.0.0',
					b: '^2.0.0',
				},
			} ),
			'node_modules/a/package.json': JSON.stringify( {
				name: 'a',
				version: '1.1.1',
				dependencies: {},
			} ),
			'node_modules/b/package.json': JSON.stringify( {
				name: 'b',
				version: '2.2.2',
				dependencies: {
					c: '3.2.1',
				},
			} ),
			'node_modules/c/package.json': JSON.stringify( {
				name: 'c',
				version: '3.2.1',
			} ),
		} );
	} );

	it( 'Generates the simplified tree', async () => {
		const tree = await effectiveTree();
		//prettier-ignore
		expect( tree ).toEqual([
			'└─ root@1.0.0',
			'   ├─ a@1.1.1',
			'   └─ b@2.2.2',
			'      └─ c@3.2.1',
		].join( '\n' ));
	} );

	afterEach( () => {
		mockFs.restore();
	} );
} );

const path = require( 'path' );
const micromatch = require( 'micromatch' );

const mockedFiles = {
	'package.json': {
		name: 'root',
		version: '1.0.0',
		dependencies: {
			a: '^1.0.0',
			b: '^2.0.0',
		},
	},
	'node_modules/a/package.json': {
		name: 'a',
		version: '1.1.1',
		dependencies: {},
	},
	'node_modules/b/package.json': {
		name: 'b',
		version: '2.2.2',
		dependencies: {
			c: '3.2.1',
		},
	},
	'node_modules/c/package.json': {
		name: 'c',
		version: '3.2.1',
	},
};

Object.entries( mockedFiles ).forEach( ( [ file, content ] ) => {
	jest.mock( path.join( '/project/root', file ), () => content, { virtual: true } );
} );

jest.mock( 'globby', () => ( pattern, { ignore = [] } = {} ) => {
	const files = Object.keys( mockedFiles ).filter(
		file => micromatch.isMatch( file, pattern ) && ! micromatch.isMatch( file, ignore )
	);
	return Promise.resolve( files );
} );

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
		jest.spyOn( console, 'warn' ).mockImplementation();
	} );

	it( 'Generates the simplified tree', async () => {
		const tree = await effectiveTree( {
			root: '/project/root',
			exclude: [],
		} );
		//prettier-ignore
		expect( tree ).toEqual([
			'└─ root@1.0.0',
			'   ├─ a@1.1.1',
			'   └─ b@2.2.2',
			'      └─ c@3.2.1',
		].join( '\n' ));
	} );

	it( 'Excludes items from the tree', async () => {
		const tree = await effectiveTree( {
			root: '/project/root',
			exclude: [ 'node_modules/c/**' ],
		} );
		//prettier-ignore
		expect( tree ).toEqual([
			'└─ root@1.0.0',
			'   ├─ a@1.1.1',
			'   └─ b@2.2.2'
		].join( '\n' ));

		//eslint-disable-next-line no-console
		expect( console.warn.mock.calls ).toEqual( [
			[ "Can't find a candidate for c in node_modules/b" ],
		] );
	} );

	afterEach( () => {
		//eslint-disable-next-line no-console
		console.warn.mockRestore();
	} );
} );

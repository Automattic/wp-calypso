const mockedFiles = {
	'/project/root/package.json': {
		name: 'root',
		version: '1.0.0',
		dependencies: {
			a: '^1.0.0',
			b: '^2.0.0',
		},
	},
	'/project/root/node_modules/a/package.json': {
		name: 'a',
		version: '1.1.1',
		dependencies: {},
	},
	'/project/root/node_modules/b/package.json': {
		name: 'b',
		version: '2.2.2',
		dependencies: {
			c: '3.2.1',
		},
	},
	'/project/root/node_modules/c/package.json': {
		name: 'c',
		version: '3.2.1',
	},
};

Object.entries( mockedFiles ).forEach( ( [ file, content ] ) => {
	jest.mock( file, () => content, { virtual: true } );
} );

const { candidates, effectiveTree } = require( '../index' );

describe( 'Candidate generation', () => {
	it( 'Traverses the path', () => {
		const paths = Array.from( candidates( '/project/root/a/node_modules/b/node_modules/c' ) );
		expect( paths ).toStrictEqual( [
			'/project/root/a/node_modules/b/node_modules/c/node_modules',
			'/project/root/a/node_modules/b/node_modules',
			'/project/root/a/node_modules',
			'/project/root/node_modules',
			'/project/node_modules',
			'/node_modules',
			'/node_modules',
		] );
	} );
} );

describe( 'Effective tree generation', () => {
	beforeEach( () => {
		jest.spyOn( console, 'warn' ).mockImplementation();
	} );

	it( 'Generates the simplified tree', async () => {
		const tree = await effectiveTree( '/project/root/package.json' );
		//prettier-ignore
		expect( tree ).toEqual([
			'└─ root@1.0.0',
			'   ├─ a@1.1.1',
			'   └─ b@2.2.2',
			'      └─ c@3.2.1',
		].join( '\n' ));
	} );

	afterEach( () => {
		//eslint-disable-next-line no-console
		console.warn.mockRestore();
	} );
} );

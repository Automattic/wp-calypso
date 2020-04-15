const mockFiles = filesToMock => {
	Object.entries( filesToMock ).forEach( ( [ file, content ] ) => {
		jest.mock( file, () => content, { virtual: true } );
	} );
};
mockFiles( {
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
} );

const { candidates, getEffectiveTreeAsTree } = require( '../index' );

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

	describe( 'as tree', () => {
		it( 'Generates the simplified tree', () => {
			const tree = getEffectiveTreeAsTree( '/project/root/package.json' );
			//prettier-ignore
			expect(tree).toEqual([
				'└─ root@1.0.0',
				'   ├─ a@1.1.1',
				'   └─ b@2.2.2',
				'      └─ c@3.2.1',
			].join('\n'));
		} );

		it( 'Detects circular dependencies', () => {
			mockFiles( {
				'/project/root/node_modules/c/package.json': {
					name: 'c',
					version: '3.2.1',
					dependencies: {
						b: '^2.0.0',
					},
				},
			} );

			jest.resetModules();
			//eslint-disable-next-line no-shadow
			const { getEffectiveTreeAsTree } = require( '../index' );
			const tree = getEffectiveTreeAsTree( '/project/root/package.json' );

			//prettier-ignore
			expect(tree).toEqual([
				'└─ root@1.0.0',
				'   ├─ a@1.1.1',
				'   └─ b@2.2.2',
				'      └─ c@3.2.1',
				'         └─ b@2.2.2: [Circular]'
			].join('\n'));
		} );

		it( 'Does not cache circular dependencies', async () => {
			jest.resetModules();
			mockFiles( {
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
					dependencies: {
						b: '^2.0.0',
					},
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
					dependencies: {
						a: '^1.0.0',
					},
				},
			} );

			//eslint-disable-next-line no-shadow
			const { getEffectiveTreeAsTree } = require( '../index' );
			const tree = await getEffectiveTreeAsTree( '/project/root/package.json' );

			/**
			 * Note that when we find 'b' in the second chain (root->b->...), it has been processed previously in the first chain
			 * (root->a->b->...). However, because that first chain ended in a circular dependency, none of the packages in the chain
			 * was cached.
			 *
			 * This is a good thing. Otherwise, when we process 'b' the chain root->b we would pick 'b' from the cache,
			 * (equal to 'b->c->a[Circular]'), and we would end up with the chain root->b->c->a[Circular], which is not true.
			 *
			 * So tldr: branches with [Circular] dependencies are not cached, and this test is asserting that behaviour.
			 */

			//prettier-ignore
			expect(tree).toEqual([
				'└─ root@1.0.0',
				'   ├─ a@1.1.1',
				'   │  └─ b@2.2.2',
				'   │     └─ c@3.2.1',
				'   │        └─ a@1.1.1: [Circular]',
				'   └─ b@2.2.2',
				'      └─ c@3.2.1',
				'         └─ a@1.1.1',
				'            └─ b@2.2.2: [Circular]',
			].join('\n'));
		} );
	} );

	describe( 'as list', () => {
		it( 'Complex tree', async () => {
			jest.resetModules();
			mockFiles( {
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
					dependencies: {
						b: '^2.0.0',
					},
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
					dependencies: {
						a: '^1.0.0',
					},
				},
			} );

			//eslint-disable-next-line no-shadow
			const { getEffectiveTreeAsList } = require( '../index' );
			const tree = await getEffectiveTreeAsList( '/project/root/package.json' );

			//prettier-ignore
			expect(tree).toEqual([
				'root@1.0.0',
				'root@1.0.0 a@1.1.1',
				'root@1.0.0 a@1.1.1 b@2.2.2',
				'root@1.0.0 a@1.1.1 b@2.2.2 c@3.2.1',
				'root@1.0.0 a@1.1.1 b@2.2.2 c@3.2.1 a@1.1.1 [Circular]',
				'root@1.0.0 b@2.2.2',
				'root@1.0.0 b@2.2.2 c@3.2.1',
				'root@1.0.0 b@2.2.2 c@3.2.1 a@1.1.1',
				'root@1.0.0 b@2.2.2 c@3.2.1 a@1.1.1 b@2.2.2 [Circular]',
			].join('\n'));
		} );
	} );

	afterEach( () => {
		//eslint-disable-next-line no-console
		console.warn.mockRestore();
	} );
} );

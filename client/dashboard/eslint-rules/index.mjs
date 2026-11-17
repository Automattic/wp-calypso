import path from 'path';

const CLIENT_DIR = path.resolve( import.meta.dirname, '../..' );
const ROUTER_DIR = path.join( CLIENT_DIR, 'dashboard/app/router' );

const MOCK_FUNCTIONS = new Set( [ 'mock', 'doMock', 'importMock' ] );
const TEST_FUNCTIONS = new Set( [ 'describe', 'test', 'it' ] );

/**
 * The module a `vi.mock()`, `vi.doMock()` or `vi.importMock()` call mocks, when the call names it
 * statically: as a string, a template literal without expressions, or `import( '…' )`.
 */
function getMockedModule( node ) {
	const { callee } = node;
	if (
		callee.type !== 'MemberExpression' ||
		callee.object.type !== 'Identifier' ||
		callee.object.name !== 'vi' ||
		callee.property.type !== 'Identifier' ||
		! MOCK_FUNCTIONS.has( callee.property.name )
	) {
		return null;
	}

	let [ argument ] = node.arguments;
	if ( argument?.type === 'ImportExpression' ) {
		argument = argument.source;
	}
	if ( argument?.type === 'Literal' && typeof argument.value === 'string' ) {
		return argument.value;
	}
	if ( argument?.type === 'TemplateLiteral' && argument.expressions.length === 0 ) {
		return argument.quasis[ 0 ].value.cooked;
	}
	return null;
}

// The package itself or one of its subpaths, but not a sibling package such as
// `@tanstack/react-query-persist-client`.
const isPackageOrSubpath = ( module, name ) => module === name || module.startsWith( `${ name }/` );

// The file or folder a relative or `calypso/` module path points at.
function resolveModulePath( module, filename ) {
	if ( module.startsWith( '.' ) ) {
		return path.resolve( path.dirname( filename ), module );
	}
	if ( module.startsWith( 'calypso/' ) ) {
		return path.join( CLIENT_DIR, module.slice( 'calypso/'.length ) );
	}
	return null;
}

const queryMockMessage =
	'Mocking `{{ module }}` replaces the code under test. Mock the network request with `nock`, or pass a `QueryClient` holding the data to `render()` from test-utils. See docs/testing.md.';

const bannedPackages = {
	'@tanstack/react-query': 'queryMock',
	'@automattic/api-queries': 'queryMock',
	'@automattic/api-core': 'apiCoreMock',
	'@wordpress/i18n': 'i18nMock',
};

/** @type {import('eslint').Rule.RuleModule} */
const noBannedModuleMocks = {
	meta: {
		type: 'problem',
		docs: { description: 'Disallow mocking packages that Dashboard tests should run for real.' },
		messages: {
			queryMock: queryMockMessage,
			apiCoreMock:
				'Mocking `@automattic/api-core` skips the request the code under test makes. Mock the network request with `nock` instead. See docs/testing.md.',
			i18nMock:
				'Don’t mock `@wordpress/i18n`. In tests, `__()` and the other functions already return the strings they’re given.',
		},
		schema: [],
	},
	create( context ) {
		return {
			CallExpression( node ) {
				const module = getMockedModule( node );
				const name =
					module &&
					Object.keys( bannedPackages ).find( ( pkg ) => isPackageOrSubpath( module, pkg ) );
				if ( name ) {
					context.report( { node, messageId: bannedPackages[ name ], data: { module: name } } );
				}
			},
		};
	},
};

/** @type {import('eslint').Rule.RuleModule} */
const noRouterMocks = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow mocking `@tanstack/react-router` or the Dashboard’s `app/router/*`.',
		},
		messages: {
			routerMock:
				'Mocking `@tanstack/react-router` or `app/router/*` breaks whenever the code reads a route the mock doesn’t define. Build the real route tree and a test router instead. See docs/testing.md.',
		},
		schema: [],
	},
	create( context ) {
		return {
			CallExpression( node ) {
				const module = getMockedModule( node );
				if ( ! module ) {
					return;
				}
				const modulePath = resolveModulePath( module, context.filename );
				if (
					isPackageOrSubpath( module, '@tanstack/react-router' ) ||
					( modulePath &&
						( modulePath === ROUTER_DIR || modulePath.startsWith( ROUTER_DIR + path.sep ) ) )
				) {
					context.report( { node, messageId: 'routerMock' } );
				}
			},
		};
	},
};

// The identifier a call chain starts from: `test` in `test.concurrent.each( … )( … )` or
// in `test.each`…``.
function getChainRoot( node ) {
	let root = node;
	for (;;) {
		if ( root.type === 'MemberExpression' ) {
			root = root.object;
		} else if ( root.type === 'CallExpression' ) {
			root = root.callee;
		} else if ( root.type === 'TaggedTemplateExpression' ) {
			root = root.tag;
		} else {
			return root;
		}
	}
}

// Whether `identifier` is Vitest's global or an import from `vitest`, rather than a local
// variable of the same name.
function isVitestFunction( identifier, sourceCode ) {
	for ( let scope = sourceCode.getScope( identifier ); scope; scope = scope.upper ) {
		const variable = scope.set.get( identifier.name );
		if ( variable ) {
			return variable.defs.every(
				( def ) => def.type === 'ImportBinding' && def.parent.source.value === 'vitest'
			);
		}
	}
	return true;
}

// Enable it only for files Vitest doesn't run: the rule reports any test in the file.
/** @type {import('eslint').Rule.RuleModule} */
const noSkippedTestFile = {
	meta: {
		type: 'problem',
		docs: { description: 'Disallow tests in a file that Vitest doesn’t run.' },
		messages: {
			skipped:
				'Vitest only runs `*.test.*` files directly inside a `test/` folder, so it skips this file. Rename it, or move it there.',
		},
		schema: [],
	},
	create( context ) {
		let reported = false;
		function check( node, callee ) {
			const root = getChainRoot( callee );
			if (
				! reported &&
				root.type === 'Identifier' &&
				TEST_FUNCTIONS.has( root.name ) &&
				isVitestFunction( root, context.sourceCode )
			) {
				reported = true;
				context.report( { node, messageId: 'skipped' } );
			}
		}
		return {
			CallExpression: ( node ) => check( node, node.callee ),
			TaggedTemplateExpression: ( node ) => check( node, node.tag ),
		};
	},
};

/** @type {import('eslint').ESLint.Plugin} */
export default {
	rules: {
		'no-banned-module-mocks': noBannedModuleMocks,
		'no-router-mocks': noRouterMocks,
		'no-skipped-test-file': noSkippedTestFile,
	},
};

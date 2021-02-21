/**
 * Single Tree Rendering Codemod
 *
 * Transforms `ReactDom.render()` to `context.primary/secondary`.
 *
 * Transforms `renderWithReduxStore()` to `context.primary/secondary`.
 *
 * Adds `context` to params in middlewares when needed
 *
 * Adds `next` to params and `next()` to body in middlewares when using
 *   `ReactDom.render()` or `renderWithReduxStore()`.
 *
 * Adds `makeLayout` and `clientRender` to `page()` route definitions and
 *   accompanying import statement.
 *
 * Removes:
 *   `ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );`
 *
 * Removes:
 *   Un-used ReactDom imports.
 *
 * Replaces `navigation` middleware with `makeNavigation` when imported
 *   from `my-sites/controller`.
 */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const fs = require( 'fs' );
const repl = require( 'repl' );

/**
 * Internal dependencies
 */
const config = require( './config' );

export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const root = j( file.source );

	/**
	 * Gather all of the external deps and throw them in a set
	 */
	const nodeJsDeps = repl._builtinLibs;
	const packageJson = JSON.parse( fs.readFileSync( './package.json', 'utf8' ) );
	const packageJsonDeps = []
		.concat( nodeJsDeps )
		.concat( Object.keys( packageJson.dependencies ) )
		.concat( Object.keys( packageJson.devDependencies ) );

	const externalDependenciesSet = new Set( packageJsonDeps );

	/**
	 * Is an import external
	 *
	 * @param  {object}  importNode Node object
	 * @returns {boolean}            True if import is external
	 */
	const isExternal = ( importNode ) =>
		externalDependenciesSet.has( importNode.source.value.split( '/' )[ 0 ] );

	/**
	 * Removes the extra newlines between two import statements
	 * caused by `insertAfter()`:
	 *
	 * @link https://github.com/benjamn/recast/issues/371
	 *
	 * @param  {string} str String
	 * @returns {string}     Cleaned string
	 */
	function removeExtraNewlines( str ) {
		return str.replace( /(import.*\n)\n+(import)/g, '$1$2' );
	}

	/**
	 * Check if `parameters` has `param` either as a string or as a name of
	 * an object, which could be e.g. an `Identifier`.
	 *
	 * @param  {Array}   params     Parameters to look from. Could be an array of strings or Identifier objects.
	 * @param  {string}  paramValue Parameter value
	 * @returns {boolean}            True if parameter is present
	 */
	function hasParam( params = [], paramValue ) {
		return _.some( params, ( param ) => {
			return ( param.name || param ) === paramValue;
		} );
	}

	/**
	 * Removes imports maintaining any comments above them
	 *
	 * @param {object} collection Collection containing at least one node. Comments are preserved only from first node.
	 */
	function removeImport( collection ) {
		const node = collection.nodes()[ 0 ];

		// Find out if import had comments above it
		const comments = _.get( node, 'comments', [] );

		// Remove import (and any comments with it)
		collection.remove();

		// Put back that removed comment (if any)
		if ( comments.length ) {
			const isRemovedExternal = isExternal( node );

			// Find remaining external or internal dependencies and place comments above first one
			root
				.find( j.ImportDeclaration )
				.filter( ( p ) => {
					// Look for only imports that are same type as the removed import was
					return isExternal( p.value ) === isRemovedExternal;
				} )
				.at( 0 )
				.replaceWith( ( p ) => {
					p.value.comments = p.value.comments ? p.value.comments.concat( comments ) : comments;
					return p.value;
				} );
		}
	}

	/**
	 * Catch simple redirect middlewares by looking for `page.redirect()`
	 *
	 * @example
	 * // Middleware could look like this:
	 * () => page.redirect('/foo')
	 *
	 * // ...or this:
	 * context => { page.redirect(`/foo/${context.bar}`) }
	 *
	 * // ...or even:
	 * () => {
	 *   if (true) {
	 *      page.redirect('/foo');
	 *   } else {
	 *      page.redirect('/bar');
	 *   }
	 * }
	 *
	 * @param  {object}  node AST Node
	 * @returns {boolean}      True if any `page.redirect()` exist inside the function node, otherwise False
	 */
	function isRedirectMiddleware( node ) {
		return (
			j( node )
				.find( j.MemberExpression, {
					object: {
						type: 'Identifier',
						name: 'page',
					},
					property: {
						type: 'Identifier',
						name: 'redirect',
					},
				} )
				.size() > 0
		);
	}

	/**
	 * Ensure `context` is among params
	 *
	 * @param {object} path Path object that wraps a single node
	 * @returns {object} Single node object
	 */
	function ensureContextMiddleware( path ) {
		// `context` param is already in
		if ( hasParam( path.value.params, 'context' ) ) {
			return path.value;
		}
		const ret = path.value;
		ret.params = [ j.identifier( 'context' ), ...ret.params ];

		return ret;
	}

	/**
	 * Ensure `next` is among params and `next()` is in the block's body
	 *
	 * @param {object} path Path object that wraps a single node
	 * @returns {object} Single node object
	 */
	function ensureNextMiddleware( path ) {
		// `next` param is already in
		if ( hasParam( path.value.params, 'next' ) ) {
			return path.value;
		}
		if ( path.value.params.length > 1 ) {
			// More than just a context arg, possibly not a middleware
			return path.value;
		}
		const ret = path.value;
		ret.params = [ ...ret.params, j.identifier( 'next' ) ];
		ret.body = j.blockStatement( [
			...path.value.body.body,
			j.expressionStatement( j.callExpression( j.identifier( 'next' ), [] ) ),
		] );

		return ret;
	}

	function getTarget( arg ) {
		if ( arg.type === 'Literal' ) {
			return arg.value;
		}
		if ( arg.type === 'CallExpression' ) {
			// More checks?
			return arg.arguments[ 0 ].value;
		}
	}

	/**
	 * Transform `renderWithReduxStore()` CallExpressions.
	 *
	 * @example
	 * Input
	 * ```
	 * renderWithReduxStore(
	 * 	 <Example />,
	 * 	 'primary',
	 * 	 context.store
	 * );
	 * ```
	 *
	 * Output:
	 * ```
	 * context.primary = <Example />;
	 * ```
	 *
	 * @param {object} path Path object that wraps a single node
	 * @returns {object} Single node object
	 */
	function transformRenderWithReduxStore( path ) {
		const expressionCallee = {
			name: 'renderWithReduxStore',
		};

		return transformToContextLayout( path, expressionCallee );
	}

	/**
	 * Transform `ReactDom.render()` CallExpressions.
	 *
	 * @example
	 * Input
	 * ```
	 * ReactDom.render(
	 * 	 <Example />,
	 * 	 document.getElementById( 'primary' )
	 * );
	 * ```
	 *
	 * Output:
	 * ```
	 * context.primary = <Example />;
	 * ```
	 *
	 * @param {object} path Path object that wraps a single node
	 * @returns {object} Single node object
	 */
	function transformReactDomRender( path ) {
		const expressionCallee = {
			type: 'MemberExpression',
			object: {
				name: 'ReactDom',
			},
			property: {
				name: 'render',
			},
		};

		return transformToContextLayout( path, expressionCallee );
	}

	/**
	 * Transform CallExpressions.
	 * What kind of CallExpressions this replaces depends on `expressionCallee`
	 * parameter.
	 *
	 * @example
	 * Input
	 * ```
	 * DefinedByExpressionCallee(
	 * 	 <Example />,
	 * 	 document.getElementById( 'primary' )
	 * );
	 * ```
	 *
	 * Output:
	 * ```
	 * context.primary = <Example />;
	 * ```
	 *
	 * @param {object} path Path object that wraps a single node
	 * @param {object} expressionCallee `callee` parameter for finding `CallExpression` nodes.
	 * @returns {object} Single node object
	 */
	function transformToContextLayout( path, expressionCallee ) {
		if ( path.value.params.length !== 2 ) {
			// More than just context and next args, possibly not a middleware
			return path.value;
		}
		return j( path )
			.find( j.CallExpression, {
				callee: expressionCallee,
			} )
			.replaceWith( ( p ) => {
				const contextArg = path.value.params[ 0 ];
				const target = getTarget( p.value.arguments[ 1 ] );
				return j.assignmentExpression(
					'=',
					j.memberExpression( contextArg, j.identifier( target ) ),
					p.value.arguments[ 0 ]
				);
			} );
	}

	// Transform `ReactDom.render()` to `context.primary/secondary`
	root
		.find( j.CallExpression, {
			callee: {
				type: 'MemberExpression',
				object: {
					name: 'ReactDom',
				},
				property: {
					name: 'render',
				},
			},
		} )
		.closest( j.Function )
		.replaceWith( ensureContextMiddleware )
		// Receives already transformed object from `replaceWith()` above
		.replaceWith( ensureNextMiddleware )
		.forEach( transformReactDomRender );

	// Transform `renderWithReduxStore()` to `context.primary/secondary`
	root
		.find( j.CallExpression, {
			callee: {
				name: 'renderWithReduxStore',
			},
		} )
		.closestScope()
		.replaceWith( ensureNextMiddleware )
		.forEach( transformRenderWithReduxStore );

	// Remove `renderWithReduxStore` from `import { a, renderWithReduxStore, b } from 'lib/react-helpers'`
	root
		.find( j.ImportSpecifier, {
			local: {
				name: 'renderWithReduxStore',
			},
		} )
		.remove();

	// Find empty `import 'lib/react-helpers'`
	const orphanImportHelpers = root
		.find( j.ImportDeclaration, {
			source: {
				value: 'lib/react-helpers',
			},
		} )
		.filter( ( p ) => ! p.value.specifiers.length );

	if ( orphanImportHelpers.size() ) {
		removeImport( orphanImportHelpers );
	}

	/**
	 * Removes:
	 * ```
	 * ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	 * ```
	 */
	root
		.find( j.CallExpression, {
			callee: {
				type: 'MemberExpression',
				object: {
					name: 'ReactDom',
				},
				property: {
					name: 'unmountComponentAtNode',
				},
			},
		} )
		// Ensures we remove only nodes containing `document.getElementById( 'secondary' )`
		.filter( ( p ) => _.get( p, 'value.arguments[0].arguments[0].value' ) === 'secondary' )
		.remove();

	// Find if `ReactDom` is used
	const reactDomDefs = root.find( j.MemberExpression, {
		object: {
			name: 'ReactDom',
		},
	} );

	// Remove stranded `react-dom` imports
	if ( ! reactDomDefs.size() ) {
		const importReactDom = root.find( j.ImportDeclaration, {
			specifiers: [
				{
					local: {
						name: 'ReactDom',
					},
				},
			],
			source: {
				value: 'react-dom',
			},
		} );

		if ( importReactDom.size() ) {
			removeImport( importReactDom );
		}
	}

	// Add makeLayout and clientRender middlewares to route definitions
	const routeDefs = root
		.find( j.CallExpression, {
			callee: {
				name: 'page',
			},
		} )
		.filter( ( p ) => {
			const lastArgument = _.last( p.value.arguments );

			return (
				p.value.arguments.length > 1 &&
				p.value.arguments[ 0 ].value !== '*' &&
				[ 'Identifier', 'MemberExpression', 'CallExpression' ].indexOf( lastArgument.type ) > -1 &&
				! isRedirectMiddleware( lastArgument )
			);
		} )
		.forEach( ( p ) => {
			p.value.arguments.push( j.identifier( 'makeLayout' ) );
			p.value.arguments.push( j.identifier( 'clientRender' ) );
		} );

	if ( routeDefs.size() ) {
		root
			.find( j.ImportDeclaration )
			.at( -1 )
			.insertAfter( "import { makeLayout, render as clientRender } from 'controller';" );
	}

	const source = root.toSource( config.recastOptions );

	return routeDefs.size() ? removeExtraNewlines( source ) : source;
}

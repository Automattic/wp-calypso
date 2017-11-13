/** @format */

/**
 * Single Tree Rendering Codemod
 *
 * Transforms `ReactDom.render()` to `context.primary/secondary`.
 *
 * Transforms `renderWithReduxStore()` to `context.primary/secondary`.
 *
 * Adds `context` to params in middlewares when using `ReactDom.render()`.
 *
 * Adds `next` to params and `next()` to body in middlewares when using
 *   `ReactDom.render()` or `renderWithReduxStore()`.
 *
 * Adds `makeLayout` and `clientRender` to `page()` route definitions and
 *   accompanying import statement.
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
	 * @param {object} importNode Node object
	 * @returns {boolean}
	 */
	const isExternal = importNode =>
		externalDependenciesSet.has( importNode.source.value.split( '/' )[ 0 ] );

	/**
	 * Removes the extra newlines between two import statements
 	 * caused by `insertAfter()`:
	 * @link https://github.com/benjamn/recast/issues/371
	 *
	 * @param {string} str
	 * @returns {string}
	 */
	function removeExtraNewlines( str ) {
		return str.replace( /(import.*\n)\n+(import)/g, '$1$2' );
	}

	/**
	 * Check if `parameters` has `param` either as a string or as a name of
	 * an object, which could be e.g. an `Identifier`.
	 *
	 * @param {array} parameters Parameters to look from. Could be an array of strings or Identifier objects.
	 * @param {string} parameter Parameter name
	 * @returns {boolean}
	 */
	function hasParam( params = [], paramValue ) {
		return _.some( params, param => {
			return ( param.name || param ) === paramValue;
		} );
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
		let ret = path.value;
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
		let ret = path.value;
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
			.replaceWith( p => {
				const contextArg = path.value.params[ 0 ];
				const target = getTarget( p.value.arguments[ 1 ] );
				return j.assignmentExpression(
					'=',
					j.memberExpression( contextArg, j.identifier( target ) ),
					p.value.arguments[ 0 ]
				);
			} );

		return j( node );
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

	// Remove `renderWithReduxStore` from `import { a, renderWithReduxStore, b } from 'lib/react-helpers'`
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
		.filter( p => ! p.value.specifiers.length );

	if ( orphanImportHelpers.size() ) {
		// Find out if import had comment above it
		const comment = _.get( orphanImportHelpers.nodes(), '[0].comments[0]', false );

		// Remove empty `import 'lib/react-helpers'` (and any comments with it)
		orphanImportHelpers.remove();

		// Put back that removed comment (if any)
		if ( comment ) {
			// Find internal dependencies and place comment above first one
			root
				.find( j.ImportDeclaration )
				.filter( p => ! isExternal( p.value ) )
				.at( 0 )
				.replaceWith( p => {
					p.value.comments = [ comment ];
					return p.value;
				} );
		}
	}

	/**
  	 * Transform `ReactDom.unmountComponentAtNode()` CallExpressions.
  	 *
  	 * @example
	 * Input:
	 * ```
	 * ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	 * ```
	 *
	 * Output:
	 * ```
	 * context.secondary = null;
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
		.forEach( p => {
			return _.get( p, 'value.arguments[0].arguments.value' ) === 'secondary';
		} )
		.replaceWith( p => {
			// Returns `context.secondary = null`
			return j.expressionStatement(
				j.assignmentExpression(
					'=',
					j.memberExpression( j.identifier( 'context' ), j.identifier( 'secondary' ) ),
					j.literal( null )
				)
			);
		} )
		.closest( j.Function )
		.replaceWith( ensureContextMiddleware )
		.replaceWith( ensureNextMiddleware );

	// Add makeLayout and clientRender middlewares to route definitions
	const routeDefs = root
		.find( j.CallExpression, {
			callee: {
				name: 'page',
			},
		} )
		.filter( p => p.value.arguments.length > 1 && p.value.arguments[ 0 ].value !== '*' )
		.forEach( p => {
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

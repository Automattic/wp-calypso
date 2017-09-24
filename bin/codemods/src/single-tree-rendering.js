/** @format */

const config = require( './config' );

export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const root = j( file.source );

	function addNextMiddleware( path ) {
		if ( path.value.params.length !== 1 ) {
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

	function transformRenderWithReduxStore( path ) {
		if ( path.value.params.length !== 2 ) {
			// More than just context and next args, possibly not a middleware
			return path.value;
		}
		return j( path )
			.find( j.CallExpression, {
				callee: {
					name: 'renderWithReduxStore',
				},
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
	}

	root
		.find( j.CallExpression, {
			callee: {
				name: 'renderWithReduxStore',
			},
		} )
		.closestScope()
		.replaceWith( addNextMiddleware )
		.forEach( transformRenderWithReduxStore );

	// Remove `renderWithReduxStore` from `import { a, renderWithReduxStore, b } from 'lib/react-helpers'`
	root
		.find( j.ImportSpecifier, {
			local: {
				name: 'renderWithReduxStore',
			},
		} )
		.remove();

	// Remove empty `import 'lib/react-helpers'`
	root
		.find( j.ImportDeclaration, {
			source: {
				value: 'lib/react-helpers',
			},
		} )
		.filter( p => ! p.value.specifiers.length )
		.remove();

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

	if ( routeDefs.nodes().length ) {
		// This adds a newline above the import, meh. https://github.com/benjamn/recast/issues/371
		root
			.find( j.ImportDeclaration )
			.at( -1 )
			.insertAfter( "import { makeLayout, render as clientRender } from 'controller';" );
	}

	return root.toSource( config.recastOptions );
}

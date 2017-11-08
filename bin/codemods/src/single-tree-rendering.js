/** @format */

const _ = require( 'lodash' );
const config = require( './config' );

export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const root = j( file.source );

	/**
	 * Removes the extra newlines between two import statements
 	 * caused by `insertAfter()`:
	 * @link https://github.com/benjamn/recast/issues/371
	 */
	function removeExtraNewlines( str ) {
		return str.replace( /(import.*\n)\n+(import)/g, '$1$2' );
	}

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

	// Find empty `import 'lib/react-helpers'`
	let orphanImportHelpers = root
		.find( j.ImportDeclaration, {
			source: {
				value: 'lib/react-helpers',
			},
		} )
		.filter( p => ! p.value.specifiers.length );

	if ( orphanImportHelpers.size() ) {
		// Find out if import had comment above it
		let comment = _.get( orphanImportHelpers.nodes(), '[0].comments[0]', false );

		// Remove empty `import 'lib/react-helpers'` (and any comments with it)
		orphanImportHelpers.remove();

		// Put back that removed comment (if any)
		if ( comment ) {
			// Find internal dependencies and place comment above first one
			root
				.find( j.ImportDeclaration )
				.filter( p => {
					let importValue = _.get( p, 'value.source.value', '' );
					return importValue.indexOf( '/' ) > -1;
				} )
				.at( 0 )
				.replaceWith( p => {
					p.value.comments = [ comment ];
					return p.value;
				} );
		}
	}

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

	return removeExtraNewlines( root.toSource( config.recastOptions ) );
}

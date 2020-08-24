/**
 * @file Disallow creation of selectors bound to Redux state
 * @author Automattic
 * @copyright 2017 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const REF = ' See wp-calypso#14024';
const BIND_ERROR_MESSAGE = "Don't bind functions within `connect`." + REF;
const FUNC_ERROR_MESSAGE = "Don't instantiate functions within `connect`." + REF;

function isStateInArgs( node ) {
	return node.params.some( ( { name } ) => name === 'state' );
}

function contains( xs, y ) {
	return xs.some( ( x ) => x === y );
}

module.exports = {
	meta: {
		docs: {
			description:
				'Disallow binding or instantiation of functions ' +
				'within a function passed as the first argument to `connect`.',
			recommended: true,
		},
		schema: [],
	},
	create: function ( context ) {
		/*
		 * An array of tuples of shape
		 *
		 *   ( innerNode, outerNode, reportMessage )
		 *
		 * where
		 *
		 *   - `innerNode` refers to the offending node, i.e. the Identifier or
		 *   [Arrow]FunctionExpression where binding/instantiation occurs
		 *
		 *   - `outerNode` refers to the closest [Arrow]FunctionExpression
		 *   ancestor that introduces `state` into the closure
		 *
		 *   - `reportMessage` is the error string to be passed to eslint's
		 *   `context.report`
		 *
		 * Since we need to find all occurrences of `connect` before we can
		 * tell which state-aware functions are actually forbidden from
		 * including binding/instantiation of new functions, we progressively
		 * store them in this collection.
		 *
		 */
		const reports = [];

		/*
		 * A collection of bodies of [Arrow]FunctionExpressions that ever
		 * become the first argument of `connect`. In a typical module, this
		 * array will contain 0 or 1 elements.
		 *
		 * In Program:exit, any element in `reports` whose `outer` property is
		 * contained in `nodesToReportOn` will yield an actual eslint report.
		 */
		const nodesToReportOn = [];

		/*
		 * Naming is hard. ¯\_(ツ)_/¯
		 *
		 * Refers to a body of a function that introduces `state` (via its
		 * arguments) into the subsequent closures.
		 *
		 * When traversing the AST, if this value is falsy we can assume that
		 * we are not in a closure whose broader scope contains `state`.
		 */
		let stateProviderFunctionBody;

		function onFunctionEnter( node ) {
			if ( stateProviderFunctionBody ) {
				reports.push( {
					inner: node,
					outer: stateProviderFunctionBody,
					message: FUNC_ERROR_MESSAGE,
				} );
				return;
			}

			if ( isStateInArgs( node ) ) {
				stateProviderFunctionBody = node.body;
			}
		}

		function onFunctionExit( node ) {
			if ( stateProviderFunctionBody && isStateInArgs( node ) ) {
				stateProviderFunctionBody = null;
			}
		}

		function onConnectCall( node ) {
			if ( ! node.arguments.length ) {
				return;
			}

			/*
			 * The first argument of `connect` is expected to be either a
			 * variable for a function, or an anonymous/inlined function.
			 * Let's handle both cases.
			 */
			const mapStateNode = node.arguments[ 0 ];

			let mapStateBody;

			if ( mapStateNode.type === 'Identifier' ) {
				/*
				 * If it's a variable, obtain the function it refers to,
				 * which should be readily available in scope.
				 */
				const mapStateName = mapStateNode.name;
				const variable = context.getScope().set.get( mapStateName );
				const definition = variable && variable.defs && variable.defs[ 0 ];
				mapStateBody =
					definition && definition.node && definition.node.init && definition.node.init.body;
			} else {
				/*
				 * Inlined function? Easy peasy.
				 */
				mapStateBody = mapStateNode.body;
			}

			if ( mapStateBody ) {
				nodesToReportOn.push( mapStateBody );
			}
		}

		function onBindCall( node ) {
			if ( stateProviderFunctionBody ) {
				reports.push( {
					inner: node,
					outer: stateProviderFunctionBody,
					message: BIND_ERROR_MESSAGE,
				} );
			}
		}

		function isBindCallee( node ) {
			const { callee } = node;
			if ( contains( [ 'bind', 'partial', 'partialRight' ], callee.name ) ) {
				return true;
			}

			return !! callee.property && callee.property.name === 'bind';
		}

		return {
			'Program:exit': function () {
				reports
					.filter( ( { outer } ) => contains( nodesToReportOn, outer ) )
					.forEach( ( { inner, message } ) => context.report( inner, message ) );
			},

			CallExpression: function ( node ) {
				if ( node.callee.name === 'connect' ) {
					return onConnectCall( node );
				}

				if ( isBindCallee( node ) ) {
					return onBindCall( node );
				}
			},

			FunctionExpression: onFunctionEnter,
			ArrowFunctionExpression: onFunctionEnter,

			'FunctionExpression:exit': onFunctionExit,
			'ArrowFunctionExpression:exit': onFunctionExit,
		};
	},
};

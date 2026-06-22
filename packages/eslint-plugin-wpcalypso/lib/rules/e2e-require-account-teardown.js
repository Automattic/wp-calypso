/**
 * @file Flag E2E specs that create a test account (getNewTestUser + a signup
 *       helper) but register no afterAll teardown that awaits `apiCloseAccount`,
 *       so the account (and its blogs) leaks. A floating (unawaited) call does
 *       not count, since it races worker teardown. Specs may opt out via the
 *       `allow` list. This is a coarse presence backstop, not a proof that the
 *       teardown is wired to the created account.
 * @author Automattic
 */

const path = require( 'path' );

/**
 * Whether an ancestor node is an `afterAll(...)` or `test.afterAll(...)` call.
 * @param {import('estree').Node} ancestor Candidate ancestor node.
 * @returns {boolean} True if the ancestor is an afterAll call expression.
 */
function isAfterAllCall( ancestor ) {
	if ( ancestor.type !== 'CallExpression' ) {
		return false;
	}
	const callee = ancestor.callee;
	if ( callee.type === 'Identifier' && callee.name === 'afterAll' ) {
		return true;
	}
	return (
		callee.type === 'MemberExpression' &&
		callee.property.type === 'Identifier' &&
		callee.property.name === 'afterAll'
	);
}

/**
 * Whether a callee references `getNewTestUser` (bare or as a member, e.g.
 * `DataHelper.getNewTestUser` / `helperData.getNewTestUser`).
 * @param {import('estree').Node} callee Callee node.
 * @returns {boolean} True if it references getNewTestUser.
 */
function isGetNewTestUser( callee ) {
	if ( callee.type === 'Identifier' ) {
		return callee.name === 'getNewTestUser';
	}
	return (
		callee.type === 'MemberExpression' &&
		callee.property.type === 'Identifier' &&
		callee.property.name === 'getNewTestUser'
	);
}

/**
 * Whether a callee is a member call whose property starts with `signup`
 * (signupThroughInvite, signupSocialFirstWithEmail, signupWithEmail, signupWoo,
 * signupWPCC, and flow-object variants).
 * @param {import('estree').Node} callee Callee node.
 * @returns {boolean} True if it is a signup helper member call.
 */
function isSignupHelper( callee ) {
	return (
		callee.type === 'MemberExpression' &&
		callee.property.type === 'Identifier' &&
		/^signup/.test( callee.property.name )
	);
}

/**
 * Whether a callee references `apiCloseAccount` (bare or as a member, e.g.
 * `shared.apiCloseAccount`).
 * @param {import('estree').Node} callee Callee node.
 * @returns {boolean} True if it references apiCloseAccount.
 */
function isApiCloseAccount( callee ) {
	if ( callee.type === 'Identifier' ) {
		return callee.name === 'apiCloseAccount';
	}
	return (
		callee.type === 'MemberExpression' &&
		callee.property.type === 'Identifier' &&
		callee.property.name === 'apiCloseAccount'
	);
}

/**
 * Whether a node introduces a function scope.
 * @param {import('estree').Node} node Candidate node.
 * @returns {boolean} True for function/arrow nodes.
 */
function isFunctionNode( node ) {
	return (
		node.type === 'FunctionExpression' ||
		node.type === 'FunctionDeclaration' ||
		node.type === 'ArrowFunctionExpression'
	);
}

/**
 * The function passed directly as the callback of the innermost enclosing
 * `afterAll(...)` / `test.afterAll(...)` call, or null when the node is not
 * inside an afterAll callback.
 * @param {import('estree').Node[]} ancestors The node's ancestors, root-first.
 * @returns {import('estree').Node|null} The afterAll callback function node.
 */
function afterAllCallback( ancestors ) {
	for ( let i = ancestors.length - 1; i >= 0; i-- ) {
		if ( ! isAfterAllCall( ancestors[ i ] ) ) {
			continue;
		}
		const callback = ancestors[ i + 1 ];
		if ( callback && isFunctionNode( callback ) && ancestors[ i ].arguments.includes( callback ) ) {
			return callback;
		}
		return null;
	}
	return null;
}

/**
 * The nearest enclosing function of a node, given its ancestors, or null.
 * @param {import('estree').Node[]} ancestors The node's ancestors, root-first.
 * @returns {import('estree').Node|null} The innermost function/arrow ancestor.
 */
function nearestFunction( ancestors ) {
	for ( let i = ancestors.length - 1; i >= 0; i-- ) {
		if ( isFunctionNode( ancestors[ i ] ) ) {
			return ancestors[ i ];
		}
	}
	return null;
}

/**
 * Whether `array` (an ArrayExpression) is the argument of a `Promise.all(...)` or
 * `Promise.allSettled(...)` call, i.e. its element promises are actually awaited
 * together. A bare array (`await [ p ]`, `return [ p ]`) is a non-thenable that
 * swallows its element promises, so it must not count as consuming them.
 * @param {import('estree').Node} array The ArrayExpression node.
 * @returns {boolean} True if the array is a Promise.all / Promise.allSettled argument.
 */
function isPromiseAllArgument( array ) {
	const call = array.parent;
	return Boolean(
		call &&
			call.type === 'CallExpression' &&
			call.arguments.includes( array ) &&
			call.callee.type === 'MemberExpression' &&
			call.callee.object.type === 'Identifier' &&
			call.callee.object.name === 'Promise' &&
			call.callee.property.type === 'Identifier' &&
			( call.callee.property.name === 'all' || call.callee.property.name === 'allSettled' )
	);
}

/**
 * Whether `node`'s promise is directly consumed, so awaiting/returning it gates
 * the enclosing function. "Directly" is deliberately strict to avoid accepting a
 * floated promise: only the operand of `await`/`return`, the concise arrow body
 * itself, or an element of a `Promise.all`/`allSettled` array whose call is in
 * turn directly consumed. Anything that merely *evaluates* the promise but
 * yields a different value - `void p`, `( p, x )`, `p && x`, `p ? a : b`,
 * `` tag`${ p }` ``, `wrapper( p )`, `p.then( … )` - does NOT consume it.
 * @param {import('estree').Node} node The node whose promise must be consumed.
 * @param {import('estree').Node} callback The afterAll callback function.
 * @returns {boolean} True if the promise is awaited or returned.
 */
function isDirectlyConsumed( node, callback ) {
	if ( node === callback.body ) {
		// Concise arrow body: the runner awaits the implicitly returned promise.
		return true;
	}
	const parent = node.parent;
	if ( ! parent ) {
		return false;
	}
	if ( parent.type === 'AwaitExpression' && parent.argument === node ) {
		return true;
	}
	if ( parent.type === 'ReturnStatement' && parent.argument === node ) {
		return true;
	}
	if ( parent.type === 'ArrayExpression' && isPromiseAllArgument( parent ) ) {
		// Element of Promise.all/allSettled([...]): consumed iff the call itself is.
		return isDirectlyConsumed( parent.parent, callback );
	}
	return false;
}

/**
 * Whether the `apiCloseAccount` call at `node` is consumed (awaited or returned)
 * in the afterAll callback's OWN body, so the callback's promise gates on it.
 *
 * The call must live directly in the callback body, not in a nested callback
 * (e.g. a `.map()` callback the afterAll discards), and must be directly
 * consumed (see {@link isDirectlyConsumed}). Supported: `await apiCloseAccount(
 * ... )`, `return apiCloseAccount( ... )`, the concise body `() =>
 * apiCloseAccount( ... )`, `() => Promise.all( [ ... ] )`, and an awaited/
 * returned `Promise.all`/`allSettled` array. Known limitation: `Promise.all(
 * accounts.map( ( a ) => apiCloseAccount( a ) ) )` (close in a nested callback)
 * and method chains like `apiCloseAccount( … ).then( … )` are not recognized;
 * use a for-of loop, an awaited array literal, or the allow list.
 * @param {import('estree').Node} node The apiCloseAccount CallExpression.
 * @param {import('estree').Node[]} ancestors The node's ancestors, root-first.
 * @returns {boolean} True if the call is awaited or returned by the afterAll callback.
 */
function isConsumedByAfterAll( node, ancestors ) {
	const callback = afterAllCallback( ancestors );
	if ( ! callback ) {
		return false;
	}
	// The close must be in the callback's own body, not a nested function whose
	// result the callback discards.
	if ( nearestFunction( ancestors ) !== callback ) {
		return false;
	}
	return isDirectlyConsumed( node, callback );
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require E2E specs that create a test account to register an afterAll apiCloseAccount teardown.',
		},
		schema: [
			{
				type: 'object',
				additionalProperties: false,
				properties: {
					allow: {
						type: 'array',
						uniqueItems: true,
						items: { type: 'string' },
					},
				},
			},
		],
		messages: {
			missingTeardown:
				'This spec creates a test account (getNewTestUser + a signup helper) but registers no afterAll apiCloseAccount teardown, so the account and its blogs leak. Add a test.afterAll/afterAll that awaits apiCloseAccount, or add this file to the rule allow list with justification.',
		},
	},
	create( context ) {
		const options = ( context.options && context.options[ 0 ] ) || {};
		const allow = Array.isArray( options.allow ) ? options.allow : [];

		const filename = context.filename || context.getFilename();
		const normalized = filename.split( path.sep ).join( '/' );
		if ( allow.some( ( entry ) => normalized.endsWith( entry ) ) ) {
			return {};
		}

		let usesNewTestUser = false;
		let usesSignupHelper = false;
		let hasApprovedTeardown = false;
		let firstAccountNode = null;

		// `context.getAncestors()` was removed from the rule context in ESLint 9;
		// `SourceCode#getAncestors(node)` works in both 8.40+ and 9.
		const sourceCode = context.sourceCode || context.getSourceCode();

		return {
			CallExpression( node ) {
				const callee = node.callee;

				if ( isGetNewTestUser( callee ) ) {
					usesNewTestUser = true;
					if ( ! firstAccountNode ) {
						firstAccountNode = node;
					}
				}

				if ( isSignupHelper( callee ) ) {
					usesSignupHelper = true;
				}

				if ( isApiCloseAccount( callee ) ) {
					if ( isConsumedByAfterAll( node, sourceCode.getAncestors( node ) ) ) {
						hasApprovedTeardown = true;
					}
				}
			},
			'Program:exit'() {
				if ( usesNewTestUser && usesSignupHelper && ! hasApprovedTeardown ) {
					context.report( { node: firstAccountNode, messageId: 'missingTeardown' } );
				}
			},
		};
	},
};

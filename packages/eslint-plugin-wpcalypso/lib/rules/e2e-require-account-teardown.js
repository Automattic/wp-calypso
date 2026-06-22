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
 * Whether `node` is the concise body of an arrow that is itself the `afterAll`
 * callback, e.g. `afterAll( () => apiCloseAccount( ... ) )`. The runner awaits
 * the promise the callback returns, so this is a real teardown. A concise body
 * nested deeper (e.g. a discarded `accounts.map( a => apiCloseAccount( a ) )`)
 * is NOT awaited and must not qualify.
 * @param {import('estree').Node} node The apiCloseAccount CallExpression.
 * @returns {boolean} True if the call is the returned body of the afterAll callback.
 */
function isReturnedFromAfterAllCallback( node ) {
	const arrow = node.parent;
	if ( ! arrow || arrow.type !== 'ArrowFunctionExpression' || arrow.body !== node ) {
		return false;
	}
	const call = arrow.parent;
	return Boolean(
		call &&
			call.type === 'CallExpression' &&
			call.arguments.includes( arrow ) &&
			isAfterAllCall( call )
	);
}

/**
 * Whether the `apiCloseAccount` call at `node` is actually consumed (awaited or
 * returned), not left floating. A floating call inside an `afterAll` races with
 * worker teardown and may never complete, so it does not count as teardown.
 * Accepts `await apiCloseAccount(...)` and `return apiCloseAccount(...)` (which
 * also covers `await Promise.all( accounts.map( ... ) )`), and the direct
 * `afterAll( () => apiCloseAccount(...) )` callback body.
 * @param {import('estree').Node} node The apiCloseAccount CallExpression.
 * @param {import('estree').Node[]} ancestors The node's ancestors, root-first.
 * @returns {boolean} True if the call is awaited or returned.
 */
function isAwaitedOrReturned( node, ancestors ) {
	if (
		ancestors.some(
			( ancestor ) => ancestor.type === 'AwaitExpression' || ancestor.type === 'ReturnStatement'
		)
	) {
		return true;
	}
	return isReturnedFromAfterAllCallback( node );
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
					const ancestors = sourceCode.getAncestors( node );
					if ( ancestors.some( isAfterAllCall ) && isAwaitedOrReturned( node, ancestors ) ) {
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

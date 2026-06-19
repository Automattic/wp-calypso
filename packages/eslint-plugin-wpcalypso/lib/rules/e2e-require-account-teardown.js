/**
 * @file Flag E2E specs that create a test account (getNewTestUser + a signup
 *       helper) but register no afterAll `apiCloseAccount` teardown, so the
 *       account (and its blogs) leaks. Specs may opt out via the `allow` list.
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

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	type: 'problem',
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
				'This spec creates a test account (getNewTestUser + a signup helper) but registers no afterAll apiCloseAccount teardown, so the account and its blogs leak. Add a test.afterAll/afterAll that calls apiCloseAccount, or add this file to the rule allow list with justification.',
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

				if ( callee.type === 'Identifier' && callee.name === 'apiCloseAccount' ) {
					if ( sourceCode.getAncestors( node ).some( isAfterAllCall ) ) {
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

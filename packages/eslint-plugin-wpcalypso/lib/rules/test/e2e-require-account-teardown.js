/**
 * @file Tests for the e2e-require-account-teardown rule.
 * @author Automattic
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const rule = require( '../../../lib/rules/e2e-require-account-teardown' );

const ruleTester = new RuleTester( {
	parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
} );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

ruleTester.run( 'e2e-require-account-teardown', rule, {
	valid: [
		// getNewTestUser + signup + afterAll that calls apiCloseAccount.
		{
			code: `
				const u = getNewTestUser();
				test( 'invite', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				test.afterAll( async () => {
					await apiCloseAccount( client, { userID: u.id } );
				} );
			`,
		},
		// Bare afterAll + member-form getNewTestUser + flow-object signup helper.
		{
			code: `
				const u = DataHelper.getNewTestUser();
				flow.userSignupPage.signupWithEmail( u.email );
				afterAll( async () => {
					await apiCloseAccount( client, { userID: u.id } );
				} );
			`,
		},
		// Member-form apiCloseAccount, awaited inside afterAll.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				test.afterAll( async () => {
					await shared.apiCloseAccount( client, { userID: u.id } );
				} );
			`,
		},
		// apiCloseAccount returned (not awaited) from an afterAll callback.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( () => apiCloseAccount( client, { userID: u.id } ) );
			`,
		},
		// Awaited inside a for-of loop in the afterAll callback's own body (the
		// shape invite__new-user.spec.ts uses): consumed, so it counts.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					for ( const a of accounts ) {
						await apiCloseAccount( client, { userID: a.id } );
					}
				} );
			`,
		},
		// Awaited array literal: each close is a direct argument (no nested
		// function), so Promise.all gates the callback on all of them.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					await Promise.all( [
						apiCloseAccount( client, { userID: a.id } ),
						apiCloseAccount( client, { userID: b.id } ),
					] );
				} );
			`,
		},
		// `return apiCloseAccount(...)` from a block body (not concise): the runner
		// awaits the returned promise, so it counts.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( () => {
					return apiCloseAccount( client, { userID: u.id } );
				} );
			`,
		},
		// Member-form afterAll with a concise body: test.afterAll( () => apiCloseAccount(...) ).
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				test.afterAll( () => apiCloseAccount( client, { userID: u.id } ) );
			`,
		},
		// Concise body returning Promise.all of an array of direct close calls: the
		// runner awaits the returned promise and Promise.all awaits each element.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( () => Promise.all( [
					apiCloseAccount( client, { userID: a.id } ),
					apiCloseAccount( client, { userID: b.id } ),
				] ) );
			`,
		},
		// getNewTestUser but NO signup helper (the invite__revoke shape): not a leak.
		{
			code: `
				const u = getNewTestUser();
				restAPIClient.createInvite( siteId, { email: u.email } );
			`,
		},
		// A signup helper but NO getNewTestUser: not flagged (needs both).
		{
			code: `
				test( 't', async () => {
					await pageUserSignUp.signupSocialFirstWithEmail( 'static@example.com' );
				} );
			`,
		},
		// On the allow list: creates an account, no afterAll, but exempt by path.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
			`,
			filename: 'test/e2e/specs/users/some-exempt.spec.ts',
			options: [ { allow: [ 'specs/users/some-exempt.spec.ts' ] } ],
		},
	],

	invalid: [
		// getNewTestUser + signup, no afterAll teardown at all.
		{
			code: `
				const u = getNewTestUser();
				test( 'invite', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// apiCloseAccount present, but in the test body rather than an afterAll.
		{
			code: `
				const u = getNewTestUser();
				test( 'invite', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
					await apiCloseAccount( client, { userID: u.id } );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// helperData.getNewTestUser + signupSocialFirstWithEmail, no afterAll.
		{
			code: `
				const u = helperData.getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupSocialFirstWithEmail( u.email );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// apiCloseAccount in afterAll but floating (unawaited): races teardown, does not count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					apiCloseAccount( client, { userID: u.id } );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// Concise arrow body, but nested in a discarded `.map()` (not the afterAll
		// callback): the promises are dropped, so this does not count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( () => {
					[ u ].map( ( a ) => apiCloseAccount( client, { userID: a.id } ) );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// `await` INSIDE a discarded `.map()` callback: each promise is awaited in
		// its own inner function, but the afterAll callback never awaits the array
		// of promises the map returns, so they race teardown. Must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					accounts.map( async ( a ) => await apiCloseAccount( client, { userID: a.id } ) );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// `return accounts.map( ... )` returns an array of promises, not a single
		// promise the runner awaits element-wise (no Promise.all), so the closes
		// float. Must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( () => accounts.map( ( a ) => apiCloseAccount( client, { userID: a.id } ) ) );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// Known limitation: `await Promise.all( accounts.map( ( a ) => apiCloseAccount(
		// a ) ) )` is technically correct teardown, but the close sits in a nested
		// `.map()` callback so the rule cannot tell it from a dropped map and flags
		// it. Use an awaited array literal or a for-of loop instead, or allow-list.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					await Promise.all( accounts.map( ( a ) => apiCloseAccount( client, { userID: a.id } ) ) );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// afterEach (not afterAll) does not satisfy the rule: it intentionally
		// targets a single suite-level afterAll teardown.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterEach( async () => {
					await apiCloseAccount( client, { userID: u.id } );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// `await [ apiCloseAccount(...) ]` awaits the array, not the element promise,
		// which still floats. A bare array (no Promise.all) must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					await [ apiCloseAccount( client, { userID: u.id } ) ];
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// `return [ apiCloseAccount(...) ]` returns an array of promises, not a
		// thenable the runner awaits element-wise. Must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( () => [ apiCloseAccount( client, { userID: u.id } ) ] );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// `void apiCloseAccount(...)` evaluates the close but yields undefined, so the
		// awaited value is not the close promise: it floats. Must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					await void apiCloseAccount( client, { userID: u.id } );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// Sequence expression: `( apiCloseAccount(...), other() )` returns the LAST
		// operand, so the close promise floats. Must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					await ( apiCloseAccount( client, { userID: u.id } ), Promise.resolve() );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// Logical expression: `apiCloseAccount(...) && other()` returns `other()`
		// (the close promise is truthy), so the close floats. Must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					await ( apiCloseAccount( client, { userID: u.id } ) && Promise.resolve() );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// Conditional with the close as the test: the truthy promise selects a
		// branch and the close itself floats. Must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					await ( apiCloseAccount( client, { userID: u.id } ) ? a : b );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
		// Wrapped in an arbitrary call: `wrapper( apiCloseAccount(...) )` awaits the
		// wrapper's result, not the close promise, which may be discarded. Must NOT count.
		{
			code: `
				const u = getNewTestUser();
				test( 't', async () => {
					await pageUserSignUp.signupThroughInvite( u.email );
				} );
				afterAll( async () => {
					await wrapper( apiCloseAccount( client, { userID: u.id } ) );
				} );
			`,
			errors: [ { messageId: 'missingTeardown' } ],
		},
	],
} );

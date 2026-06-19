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
					apiCloseAccount( client, { userID: u.id } );
				} );
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
	],
} );

/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	GutenbergEditorPage,
	LoginPage,
	NewPostFlow,
	setupHooks,
	UserSignupPage,
	SignupPickPlanPage,
	BrowserHelper,
	CloseAccountFlow,
	GutenboardingFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com Free' ), function () {
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const username = `e2eflowtestingfree${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
	const blogName = DataHelper.getBlogName();

	let page: Page;
	let domainSearchComponent: DomainSearchComponent;
	let gutenbergEditorPage: GutenbergEditorPage;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup', function () {
		it( 'Navigate to Signup page', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.visit();
			await page.screenshot( { path: 'login.png' } );
			const buffer = await page.screenshot();
			var form = new FormData();
			form.append( 'my_file', fs.createReadStream( 'login.png' ) );
			const data = { image: buffer.toString( 'base64' ) };
			await fetch( 'https://public-api.wordpress.com/wpcom/v2/screenshots', {
				method: 'POST',
				body: form,
			} );
			await loginPage.signup();
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			await page.screenshot( { path: 'signup.png' } );
		} );
	} );
} );

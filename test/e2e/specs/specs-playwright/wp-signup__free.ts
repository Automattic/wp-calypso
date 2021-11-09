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
	CloseAccountFlow,
	GutenboardingFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

// Skipping while new onboarding flows are in transition and we map the new tests
describe.skip( DataHelper.createSuiteTitle( 'Signup: WordPress.com Free' ), function () {
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
			await loginPage.signup();
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			await userSignupPage.signup( email, username, signupPassword );
		} );

		it( 'Select a free .wordpress.com domain', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName );
			await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( 'Select WordPress.com Free plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			await signupPickPlanPage.selectPlan( 'Free' );
		} );

		it( 'Skip the design selection prompt', async function () {
			const gutenboardingFlow = new GutenboardingFlow( page );
			await gutenboardingFlow.skipDesign();
		} );
	} );

	describe( 'Interact with editor', function () {
		it( 'Start a new post', async function () {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Return to Home dashboard', async function () {
			// Temporary workaround due to https://github.com/Automattic/wp-calypso/issues/51162.
			// Conditional can be removed once fixed.
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.openNavSidebar();
			await gutenbergEditorPage.returnToHomeDashboard();
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );

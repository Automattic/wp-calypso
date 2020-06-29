require( 'mocha' );
const { step } = require( 'mocha-steps' );
const { assert } = require( 'chai' );
const webdriver = require( 'selenium-webdriver' );
const chrome = require( 'selenium-webdriver/chrome' );
const EditorPage = require( './lib/pages/editor-page' );
const LoginPage = require( './lib/pages/login-page' );
const SignupStepsPage = require( './lib/pages/signup-steps-page' );
const PostEditorToolbarComponent = require( './lib/components/post-editor-toolbar-component' );
const NavBarComponent = require( './lib/components/nav-bar-component' );
const ProfilePage = require( './lib/pages/profile-page' );
const ReaderPage = require( './lib/pages/reader-page' );
const ViewPostPage = require( './lib/pages/view-post-page' );
const CheckoutPage = require( './lib/pages/checkout-page' );

const dataHelper = require( './lib/data-helper' );
const options = new chrome.Options();
options.addArguments(
	'user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.128 Electron/8.3.0 Safari/537.36'
);
const driverConfig = new webdriver.Builder()
	.usingServer( 'http://localhost:9515' )
	.setChromeOptions( options )
	.withCapabilities( {
		chromeOptions: {
			// Here is the path to your Electron binary.
			binary: process.env.BINARY_PATH,
			args: [ '--disable-renderer-backgrounding', '--disable-http-cache', '--start-maximized' ],
			debuggerAddress: '127.0.0.1:9222',
		},
	} )
	.forBrowser( 'electron' );

let loggedInUrl;
let driver;

before( async function () {
	this.timeout( 30000 );
	driver = await driverConfig.build();
	return await driver.sleep( 2000 );
} );

describe( 'User Can log in', function () {
	this.timeout( 30000 );

	step( 'Clear local storage', async function () {
		await driver.executeScript( 'window.localStorage.clear();' );
		return await driver.sleep( 3000 );
	} );

	step( 'Can log in', async function () {
		const loginPage = await LoginPage.Expect( driver );
		return await loginPage.login( process.env.E2EUSERNAME, process.env.E2EPASSWORD );
	} );

	step( 'Can see Reader Page after logging in', async function () {
		await ReaderPage.Expect( driver );
		return ( loggedInUrl = await driver.getCurrentUrl() );
	} );
} );

describe( 'Publish a New Post', function () {
	this.timeout( 30000 );
	const blogPostTitle = dataHelper.randomPhrase();
	const blogPostQuote =
		'“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

	step( 'Can navigate to post editor', async function () {
		const navbarComponent = await NavBarComponent.Expect( driver );
		return await navbarComponent.clickCreateNewPost();
	} );

	step( 'Can enter post title and content', async function () {
		const editorPage = await EditorPage.Expect( driver );
		await editorPage.enterTitle( blogPostTitle );
		await editorPage.enterContent( blogPostQuote + '\n' );

		const errorShown = await editorPage.errorDisplayed();
		return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
	} );

	step( 'Can publish and view content', async function () {
		const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
		await postEditorToolbarComponent.ensureSaved();
		return await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
	} );

	step( 'Can see correct post title', async function () {
		const viewPostPage = await ViewPostPage.Expect( driver );
		const postTitle = await viewPostPage.postTitle();
		return assert.strictEqual(
			postTitle.toLowerCase(),
			blogPostTitle.toLowerCase(),
			'The published blog post title is not correct'
		);
	} );

	step( 'Can return to reader', async function () {
		return await driver.get( loggedInUrl );
	} );
} );

// FIXME: flakey, should fix
describe.skip( 'Can Log Out', function () {
	this.timeout( 30000 );

	step( 'Can view profile to log out', async function () {
		const navbarComponent = await NavBarComponent.Expect( driver );
		return await navbarComponent.clickProfileLink();
	} );

	step( 'Can logout from profile page', async function () {
		const profilePage = await ProfilePage.Expect( driver );
		return await profilePage.clickSignOut();
	} );

	step( 'Can see app login page after logging out', async function () {
		return await LoginPage.Expect( driver );
	} );
} );

// FIXME: flakey, should fix
describe.skip( 'Can Sign up', function () {
	this.timeout( 90000 );
	const blogName = dataHelper.getNewBlogName();
	const emailAddress = blogName + '@e2edesktop.test';

	step( 'Clear local storage', async function () {
		await driver.executeScript( 'window.localStorage.clear();' );
		return await driver.sleep( 3000 );
	} );

	step( 'Can navigate to Create account', async function () {
		const loginPage = await LoginPage.Expect( driver );
		await loginPage.hideGdprBanner();
		return await loginPage.openCreateAccountPage();
	} );

	step( 'Can see the "Site Topic" page, and enter the site topic', async function () {
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.aboutSite();
	} );

	step( 'Choose a theme page', async function () {
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.selectTheme();
	} );

	step(
		'Can search for a blog name, can see and select a free .wordpress address',
		async function () {
			const signupStepsPage = await SignupStepsPage.Expect( driver );
			return await signupStepsPage.selectDomain( blogName );
		}
	);

	step( 'Can see the plans page and pick Business plan', async function () {
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.selectPlan( 'business' );
	} );

	step( 'Can see the account page, enter account details and submit', async function () {
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.enterAccountDetailsAndSubmit(
			emailAddress,
			blogName,
			process.env.E2EPASSWORD
		);
	} );

	step( 'Can see checkout page', async function () {
		const checkoutPage = await CheckoutPage.Expect( driver );
		await checkoutPage.isShoppingCartPresent();
	} );
} );

after( async function () {
	this.timeout( 30000 );
	return await driver.quit();
} );

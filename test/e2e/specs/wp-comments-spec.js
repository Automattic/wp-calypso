/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import * as mediaHelper from '../lib/media-helper';
import LoginFlow from '../lib/flows/login-flow';
import EditorPage from '../lib/pages/editor-page';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component';
import CommentsAreaComponent from '../lib/pages/frontend/comments-area-component';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';

const host = dataHelper.getJetpackHost();
const screenSize = driverManager.currentScreenSize();
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const mochaTimeoutMS = config.get( 'mochaTimeoutMS' );
const blogPostTitle = dataHelper.randomPhrase();
const blogPostQuote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Comments: (${ screenSize })`, function () {
	let fileDetails;
	this.timeout( mochaTimeoutMS );

	// Create image file for upload
	before( async function () {
		fileDetails = await mediaHelper.createFile();
		return fileDetails;
	} );

	describe( 'Commenting and replying to newly created post: @parallel @jetpack', function () {
		if ( host !== 'WPCOM' ) {
			step( 'Can log into Jetpack site', async function () {
				const account = dataHelper.getAccountConfig();
				const loginPage = await WPAdminLogonPage.Visit( driver, dataHelper.getJetpackSiteName() );
				await loginPage.login( account[ 0 ], account[ 1 ] );
				await WPAdminSidebar.Expect( driver );
			} );
		}

		step( 'Can login and create a new post', async function () {
			await new LoginFlow( driver ).loginAndStartNewPost();
			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( blogPostTitle );
			await editorPage.enterContent( blogPostQuote + '\n' );
		} );

		step( 'Can publish and visit site', async function () {
			const postEditorToolbar = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbar.ensureSaved();
			await postEditorToolbar.publishAndViewContent( { useConfirmStep: true } );
		} );

		step( 'Can post a comment', async function () {
			const commentArea = await CommentsAreaComponent.Expect( driver );
			return await commentArea._postComment( {
				comment: dataHelper.randomPhrase(),
				name: 'e2eTestName',
				email: 'e2eTestName@test.com',
			} );
		} );

		step( 'Can post a reply', async function () {
			// NOTE: we need to wait to prevent "You are posting comments too quickly. Slow down." error
			if ( host === 'WPCOM' ) {
				await driver.sleep( 10000 );
			} else {
				await driver.sleep( 15000 );
			}
			const commentArea = await CommentsAreaComponent.Expect( driver );
			await commentArea.reply(
				{
					comment: dataHelper.randomPhrase(),
					name: 'e2eTestName',
					email: 'e2eTestName@test.com',
				},
				2
			);
		} );
	} );

	describe( 'Commenting and replying to newly created post in Gutenberg Editor: @parallel', function () {
		step( 'Can login and create a new post', async function () {
			this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
			await this.loginFlow.loginAndStartNewPost( null, true );
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.enterTitle( blogPostTitle );
			return await gEditorComponent.enterText( blogPostQuote );
		} );

		step( 'Can publish and visit site', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can post a comment', async function () {
			const commentArea = await CommentsAreaComponent.Expect( driver );
			return await commentArea._postComment( {
				comment: dataHelper.randomPhrase(),
				name: 'e2eTestName',
				email: 'e2eTestName@test.com',
			} );
		} );

		step( 'Can post a reply', async function () {
			const commentArea = await CommentsAreaComponent.Expect( driver );
			await commentArea.reply(
				{
					comment: dataHelper.randomPhrase(),
					name: 'e2eTestName',
					email: 'e2eTestName@test.com',
				},
				2
			);
		} );
	} );
} );

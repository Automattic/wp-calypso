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
import CommentsAreaComponent from '../lib/pages/frontend/comments-area-component';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';

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

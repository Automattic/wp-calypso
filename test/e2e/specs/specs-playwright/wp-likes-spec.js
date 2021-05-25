/**
 * External dependencies
 */
import config from 'config';
import {
	BrowserHelper,
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	LikesComponent,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const host = DataHelper.getJetpackHost();
const viewportName = BrowserHelper.getViewportName();
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( `[${ host }] Likes: (${ viewportName }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	describe( 'New post', function () {
		let gEditor;
		let likesComponent;

		before( 'Can log in', async function () {
			const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
			await loginFlow.login();
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( this.page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Enter post title', async function () {
			gEditor = await GutenbergEditorPage.Expect( this.page );
			const title = DataHelper.randomPhrase();
			await gEditor.enterTitle( title );
			await gEditor.enterText( quote );
		} );

		it( 'Publish and visit post', async function () {
			await gEditor.publish( true );
		} );

		it( 'Like post', async function () {
			likesComponent = await LikesComponent.Expect( this.page );
			await likesComponent.clickLike();
		} );
	} );
} );

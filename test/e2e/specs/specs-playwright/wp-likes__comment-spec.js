/**
 * External dependencies
 */
import config from 'config';
import {
	BrowserHelper,
	DataHelper,
	LoginFlow,
	MyHomePage,
	PublishedPostsListPage,
	CommentsComponent,
	CommentsLikesComponent,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const host = DataHelper.getJetpackHost();
const viewportName = BrowserHelper.getViewportName();

describe( `[${ host }] Likes (Comment): (${ viewportName }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	describe( 'New comment', function () {
		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
			await loginFlow.login();
		} );

		it( 'Visit site', async function () {
			const myHomePage = await MyHomePage.Expect( this.page );
			await myHomePage.visitSite();
		} );

		it( 'Click on first post', async function () {
			const publishedPostsListPage = await PublishedPostsListPage.Expect( this.page );
			await publishedPostsListPage.visitPost( 1 );
		} );

		it( 'Post a comment', async function () {
			const comment = DataHelper.randomPhrase();
			const commentsComponent = await CommentsComponent.Expect( this.page );
			await commentsComponent.postComment( comment );
		} );

		it( 'Like a comment', async function () {
			const commentsLikesComponent = await CommentsLikesComponent.Expect( this.page );
			await commentsLikesComponent.clickLikeComment( 1 );
		} );
	} );
} );

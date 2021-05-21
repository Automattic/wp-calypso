/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';
import LoginFlow from '../../lib/flows/login-flow';
import CommentsAreaComponent from '../../lib/pages/frontend/comments-area-component';
import PostLikesComponent from '../../lib/pages/frontend/post-likes-component';
import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import CommentLikesComponent from '../../lib/pages/frontend/comment-likes-component';

const host = dataHelper.getJetpackHost();
const screenSize = driverManager.currentScreenSize();
const mochaTimeoutMS = config.get( 'mochaTimeoutMS' );
const blogPostTitle = dataHelper.randomPhrase();
const blogPostQuote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

/**
 * This spec ensures likes on wordpress.com posts and comments work as expected
 * for both loggedin and logged out users.
 */
describe( `[${ host }] Likes: (${ screenSize }) @parallel`, function () {
	let postUrl;
	this.timeout( mochaTimeoutMS );
	const comment = dataHelper.randomPhrase();
	const accountKey = 'gutenbergSimpleSiteUser';

	it( 'Login, create a new post and view it', async function () {
		const loginFlow = new LoginFlow( this.driver, accountKey );
		await loginFlow.loginAndStartNewPost( null, true );

		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
		await gEditorComponent.enterTitle( blogPostTitle );
		await gEditorComponent.enterText( blogPostQuote );
		postUrl = await gEditorComponent.publish( { visit: true } );
	} );

	it( 'Like post', async function () {
		const postLikes = await PostLikesComponent.Expect( this.driver );
		await postLikes.clickLike();
		await postLikes.expectLiked();
	} );

	it( 'Unlike post', async function () {
		const postLikes = await PostLikesComponent.Expect( this.driver );
		await postLikes.clickUnlike();
		await postLikes.expectNotLiked();
	} );

	it( 'Post comment', async function () {
		const commentArea = await CommentsAreaComponent.Expect( this.driver );

		// commentArea.reply fails to find .comment-reply-link at times,
		// as we're not concerned with the assertion just call postComment directly
		await commentArea._postComment( comment );
	} );

	it( 'Like comment', async function () {
		const commentLikes = await CommentLikesComponent.Expect( this.driver, comment );
		await commentLikes.likeComment();
		await commentLikes.expectLiked();
	} );

	it( 'Unlike comment', async function () {
		const commentLikes = await CommentLikesComponent.Expect( this.driver, comment );
		await commentLikes.unlikeComment();
		await commentLikes.expectNotLiked();
	} );

	it( 'Like post as logged out user', async function () {
		await driverManager.ensureNotLoggedIntoSite( this.driver, postUrl );

		const postLikes = await PostLikesComponent.Visit( this.driver, postUrl );
		await postLikes.clickLike();

		const loginFlow = new LoginFlow( this.driver, accountKey );
		await loginFlow.loginUsingPopup();

		await postLikes.expectLiked();

		// And Unlike it
		await postLikes.clickUnlike();
		await postLikes.expectNotLiked();
	} );
} );

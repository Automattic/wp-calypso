/**
 * Node dependencies
 */
import { join } from 'path';
import { URL } from 'url';

/**
 * External dependencies
 */
import { times, castArray } from 'lodash';
import fetch from 'node-fetch';

/**
 * WordPress dependencies
 */
import { addQueryArgs } from '@wordpress/url';

const WP_ADMIN_USER = {
	username: 'admin',
	password: 'password',
};

const {
	WP_BASE_URL = 'http://localhost:8889',
	WP_USERNAME = WP_ADMIN_USER.username,
	WP_PASSWORD = WP_ADMIN_USER.password,
} = process.env;

/**
 * Platform-specific meta key.
 *
 * @see pressWithModifier
 *
 * @type {string}
 */
export const META_KEY = process.platform === 'darwin' ? 'Meta' : 'Control';

jest.setTimeout( 100000 );

/**
 * Platform-specific modifier for the access key chord.
 *
 * @see pressWithModifier
 *
 * @type {string}
 */
export const ACCESS_MODIFIER_KEYS = process.platform === 'darwin' ? [ 'Control', 'Alt' ] : [ 'Shift', 'Alt' ];

/**
 * Regular expression matching zero-width space characters.
 *
 * @type {RegExp}
 */
const REGEXP_ZWSP = /[\u200B\u200C\u200D\uFEFF]/;

/**
 * Base URL for WP.com
 * @type {string}
 */
const WPCOM_LOGIN_URL = 'https://wordpress.com/log-in';

/**
 * Given an array of functions, each returning a promise, performs all
 * promises in sequence (waterfall) order.
 *
 * @param {Function[]} sequence Array of promise creators.
 *
 * @return {Promise} Promise resolving once all in the sequence complete.
 */
async function promiseSequence( sequence ) {
	return sequence.reduce(
		( current, next ) => current.then( next ),
		Promise.resolve()
	);
}

export function getUrl( WPPath, query = '' ) {
	const url = new URL( WP_BASE_URL );

	url.pathname = join( url.pathname, WPPath );
	url.search = query;

	return url.href;
}

function isWPPath( WPPath, query = '' ) {
	const currentUrl = new URL( page.url() );

	currentUrl.search = query;

	return getUrl( WPPath ) === currentUrl.href;
}

function isWPComLogin() {
	const url = new URL( WPCOM_LOGIN_URL );
	const currentUrl = new URL( page.url() );

	currentUrl.search = '';

	return url.href === currentUrl.href;
}

async function goToWPPath( WPPath, query ) {
	await page.goto( getUrl( WPPath, query ) );
}

async function login( username = WP_USERNAME, password = WP_PASSWORD ) {
	await page.focus( '#user_login' );
	await pressWithModifier( META_KEY, 'a' );
	await page.type( '#user_login', username );
	await page.focus( '#user_pass' );
	await pressWithModifier( META_KEY, 'a' );
	await page.type( '#user_pass', password );

	await Promise.all( [
		page.waitForNavigation(),
		page.click( '#wp-submit' ),
	] );
}

async function dotComLogin( username = WP_USERNAME, password = WP_PASSWORD ) {
	await page.focus( '#usernameOrEmail' );
	await pressWithModifier( META_KEY, 'a' );
	await page.type( '#usernameOrEmail', username );
	await page.keyboard.press( 'Enter' );
	await page.waitFor(2000);
	await page.focus( '#password' );
	await pressWithModifier( META_KEY, 'a' );
	await page.type( '#password', password );
	await page.keyboard.press( 'Enter' );
	await page.waitFor(2000);

	// await Promise.all( [
	// 	page.waitForNavigation(),
	// ] );
}

/**
 * Switches the current user to the admin user (if the user
 * running the test is not already the admin user).
 */
export async function switchToAdminUser() {
	if ( WP_USERNAME === WP_ADMIN_USER.username ) {
		return;
	}
	await goToWPPath( 'wp-login.php' );
	await login( WP_ADMIN_USER.username, WP_ADMIN_USER.password );
}

/**
 * Switches the current user to whichever user we should be
 * running the tests as (if we're not already that user).
 */
export async function switchToTestUser() {
	if ( WP_USERNAME === WP_ADMIN_USER.username ) {
		return;
	}
	await goToWPPath( 'wp-login.php' );
	await login();
}

export async function visitAdmin( adminPath, query ) {
	await goToWPPath( join( 'wp-admin', adminPath ), query );

	if ( isWPPath( 'wp-login.php' ) ) {
		await login();
		return visitAdmin( adminPath, query );
	}

	if ( isWPComLogin() ) {
		await dotComLogin();
		return visitAdmin( adminPath, query );
	}
}

function delay( time ) {
	return new Promise( function( resolve ) {
		setTimeout( resolve, time );
	} );
}

export async function newPost( {
	postType,
	title,
	content,
	excerpt,
	enableTips = false,
} = {} ) {
	const query = addQueryArgs( '', {
		post_type: postType,
		post_title: title,
		content,
		excerpt,
	} ).slice( 1 );
	await visitAdmin( 'post-new.php', query );

	await delay(2000);

	await page.evaluate( ( _enableTips ) => {
		const action = _enableTips ? 'enableTips' : 'disableTips';
		wp.data.dispatch( 'core/nux' )[ action ]();
	}, enableTips );
	await delay(2000);

	if ( enableTips ) {
		await page.reload();
	}
}

/**
 * Toggles the screen option with the given label.
 *
 * @param {string}   label           The label of the screen option, e.g. 'Show Tips'.
 * @param {?boolean} shouldBeChecked If true, turns the option on. If false, off. If
 *                                   undefined, the option will be toggled.
 */
export async function toggleOption( label, shouldBeChecked = undefined ) {
	await clickOnMoreMenuItem( 'Options' );
	const [ handle ] = await page.$x( `//label[contains(text(), "${ label }")]` );

	const isChecked = await page.evaluate( ( element ) => element.control.checked, handle );
	if ( isChecked !== shouldBeChecked ) {
		await handle.click();
	}

	await page.click( 'button[aria-label="Close dialog"]' );
}

export async function arePrePublishChecksEnabled( ) {
	return page.evaluate( () => window.wp.data.select( 'core/editor' ).isPublishSidebarEnabled() );
}

export async function enablePrePublishChecks( ) {
	await toggleOption( 'Enable Pre-publish Checks', true );
}

export async function disablePrePublishChecks( ) {
	await toggleOption( 'Enable Pre-publish Checks', false );
}

export async function setViewport( type ) {
	const allowedDimensions = {
		large: { width: 960, height: 700 },
		small: { width: 600, height: 700 },
	};
	const currentDimension = allowedDimensions[ type ];
	await page.setViewport( currentDimension );
	await waitForPageDimensions( currentDimension.width, currentDimension.height );
}

/**
 * Function that waits until the page viewport has the required dimensions.
 * It is being used to address a problem where after using setViewport the execution may continue,
 * without the new dimensions being applied.
 * https://github.com/GoogleChrome/puppeteer/issues/1751
 *
 * @param {number} width  Width of the window.
 * @param {height} height Height of the window.
 */
export async function waitForPageDimensions( width, height ) {
	await page.mainFrame().waitForFunction(
		`window.innerWidth === ${ width } && window.innerHeight === ${ height }`
	);
}

export async function switchToEditor( mode ) {
	await page.click( '.edit-post-more-menu [aria-label="Show more tools & options"]' );
	const [ button ] = await page.$x( `//button[contains(text(), '${ mode } Editor')]` );
	await button.click( 'button' );
}

/**
 * Returns a promise which resolves with the edited post content (HTML string).
 *
 * @return {Promise} Promise resolving with post content markup.
 */
export async function getEditedPostContent() {
	const content = await page.evaluate( () => {
		const { select } = window.wp.data;
		return select( 'core/editor' ).getEditedPostContent();
	} );

	// Globally guard against zero-width characters.
	if ( REGEXP_ZWSP.test( content ) ) {
		throw new Error( 'Unexpected zero-width space character in editor content.' );
	}

	return content;
}

/**
 * Verifies that the edit post sidebar is opened, and if it is not, opens it.
 *
 * @return {Promise} Promise resolving once the edit post sidebar is opened.
 */
export async function ensureSidebarOpened() {
	// This try/catch flow relies on the fact that `page.$eval` throws an error
	// if the element matching the given selector does not exist. Thus, if an
	// error is thrown, it can be inferred that the sidebar is not opened.
	try {
		return page.$eval( '.edit-post-sidebar', () => {} );
	} catch ( error ) {
		return page.click( '.edit-post-header__settings [aria-label="Settings"]' );
	}
}

/**
 * Clicks the default block appender.
 */
export async function clickBlockAppender() {
	await page.click( '.editor-default-block-appender__content' );
}

/**
 * Search for block in the global inserter
 *
 * @param {string} searchTerm The text to search the inserter for.
 */
export async function searchForBlock( searchTerm ) {
	await page.click( '.edit-post-header [aria-label="Add block"]' );
	// Waiting here is necessary because sometimes the inserter takes more time to
	// render than Puppeteer takes to complete the 'click' action
	await page.waitForSelector( '.editor-inserter__menu' );
	await page.keyboard.type( searchTerm );
}

/**
 * Opens the inserter, searches for the given term, then selects the first
 * result that appears.
 *
 * @param {string} searchTerm The text to search the inserter for.
 * @param {string} panelName  The inserter panel to open (if it's closed by default).
 */
export async function insertBlock( searchTerm, panelName = null ) {
	await searchForBlock( searchTerm );
	if ( panelName ) {
		const panelButton = ( await page.$x( `//button[contains(text(), '${ panelName }')]` ) )[ 0 ];
		await panelButton.click();
	}
	await page.click( `button[aria-label="${ searchTerm }"]` );
}

export async function convertBlock( name ) {
	await page.mouse.move( 200, 300, { steps: 10 } );
	await page.mouse.move( 250, 350, { steps: 10 } );
	await page.click( '.editor-block-switcher__toggle' );
	await page.click( `.editor-block-types-list__item[aria-label="${ name }"]` );
}

/**
 * Performs a key press with modifier (Shift, Control, Meta, Mod), where "Mod"
 * is normalized to platform-specific modifier (Meta in MacOS, else Control).
 *
 * @param {string|Array} modifiers Modifier key or array of modifier keys.
 * @param {string} key      	   Key to press while modifier held.
 */
export async function pressWithModifier( modifiers, key ) {
	const modifierKeys = castArray( modifiers );

	await Promise.all(
		modifierKeys.map( async ( modifier ) => page.keyboard.down( modifier ) )
	);

	await page.keyboard.press( key );

	await Promise.all(
		modifierKeys.map( async ( modifier ) => page.keyboard.up( modifier ) )
	);
}

/**
 * Clicks on More Menu item, searches for the button with the text provided and clicks it.
 *
 * @param {string} buttonLabel The label to search the button for.
 */
export async function clickOnMoreMenuItem( buttonLabel ) {
	await expect( page ).toClick( '.edit-post-more-menu [aria-label="Show more tools & options"]' );
	await page.click( `.edit-post-more-menu__content button[aria-label="${ buttonLabel }"]` );
}

/**
 * Opens the publish panel.
 */
export async function openPublishPanel() {
	await page.click( '.editor-post-publish-panel__toggle' );

	// Disable reason: Wait for the animation to complete, since otherwise the
	// click attempt may occur at the wrong point.
	// eslint-disable-next-line no-restricted-syntax
	await page.waitFor( 100 );
}

/**
 * Publishes the post, resolving once the request is complete (once a notice
 * is displayed).
 *
 * @return {Promise} Promise resolving when publish is complete.
 */
export async function publishPost() {
	await openPublishPanel();

	// Publish the post
	await page.click( '.editor-post-publish-button' );

	// A success notice should show up
	return page.waitForSelector( '.components-notice.is-success' );
}

/**
 * Publishes the post without the pre-publish checks,
 * resolving once the request is complete (once a notice is displayed).
 *
 * @return {Promise} Promise resolving when publish is complete.
 */
export async function publishPostWithoutPrePublishChecks() {
	await page.click( '.editor-post-publish-button' );
	return page.waitForSelector( '.components-notice.is-success' );
}

/**
 * Saves the post as a draft, resolving once the request is complete (once the
 * "Saved" indicator is displayed).
 *
 * @return {Promise} Promise resolving when draft save is complete.
 */
export async function saveDraft() {
	await page.click( '.editor-post-save-draft' );
	return page.waitForSelector( '.editor-post-saved-state.is-saved' );
}

/**
 * Given the clientId of a block, selects the block on the editor.
 *
 * @param {string} clientId Identified of the block.
 */
export async function selectBlockByClientId( clientId ) {
	await page.evaluate( ( id ) => {
		wp.data.dispatch( 'core/editor' ).selectBlock( id );
	}, clientId );
}

/**
 * Clicks on the button in the header which opens Document Settings sidebar when it is closed.
 */
export async function openDocumentSettingsSidebar() {
	const openButton = await page.$( '.edit-post-header__settings button[aria-label="Settings"][aria-expanded="false"]' );

	if ( openButton ) {
		await page.click( openButton );
	}
}

/**
 * Presses the given keyboard key a number of times in sequence.
 *
 * @param {string} key   Key to press.
 * @param {number} count Number of times to press.
 *
 * @return {Promise} Promise resolving when key presses complete.
 */
export async function pressTimes( key, count ) {
	return promiseSequence( times( count, () => () => page.keyboard.press( key ) ) );
}

export async function clearLocalStorage() {
	await page.evaluate( () => window.localStorage.clear() );
}

/**
 * Callback which automatically accepts dialog.
 *
 * @param {puppeteer.Dialog} dialog Dialog object dispatched by page via the 'dialog' event.
 */
async function acceptPageDialog( dialog ) {
	await dialog.accept();
}

/**
 * Enables even listener which accepts a page dialog which
 * may appear when navigating away from Gutenberg.
 */
export function enablePageDialogAccept() {
	page.on( 'dialog', acceptPageDialog );
}

/**
 * Click on the close button of an open modal.
 *
 * @param {?string} modalClassName Class name for the modal to close
 */
export async function clickOnCloseModalButton( modalClassName ) {
	let closeButtonClassName = '.components-modal__header .components-icon-button';

	if ( modalClassName ) {
		closeButtonClassName = `${ modalClassName } ${ closeButtonClassName }`;
	}

	const closeButton = await page.$( closeButtonClassName );

	if ( closeButton ) {
		await page.click( closeButtonClassName );
	}
}

/**
 * Sets code editor content
 * @param {string} content New code editor content.
 *
 * @return {Promise} Promise resolving with an array containing all blocks in the document.
 */
export async function setPostContent( content ) {
	return await page.evaluate( ( _content ) => {
		const { dispatch } = window.wp.data;
		const blocks = wp.blocks.parse( _content );
		dispatch( 'core/editor' ).resetBlocks( blocks );
	}, content );
}

/**
 * Returns an array with all blocks; Equivalent to calling wp.data.select( 'core/editor' ).getBlocks();
 *
 * @return {Promise} Promise resolving with an array containing all blocks in the document.
 */
export async function getAllBlocks() {
	return await page.evaluate( () => {
		const { select } = window.wp.data;
		return select( 'core/editor' ).getBlocks();
	} );
}

/**
 * Binds to the document on page load which throws an error if a `focusout`
 * event occurs without a related target (i.e. focus loss).
 */
export function observeFocusLoss() {
	page.on( 'load', () => {
		page.evaluate( () => {
			document.body.addEventListener( 'focusout', ( event ) => {
				if ( ! event.relatedTarget ) {
					throw new Error( 'Unexpected focus loss' );
				}
			} );
		} );
	} );
}

/**
 * Creates a function to determine if a request is embedding a certain URL.
 *
 * @param {string} url The URL to check against a request.
 * @return {function} Function that determines if a request is for the embed API, embedding a specific URL.
 */
export function isEmbedding( url ) {
	return ( request ) => matchURL( 'oembed%2F1.0%2Fproxy' )( request ) && parameterEquals( 'url', url )( request );
}

/**
 * Respond to a request with a JSON response.
 *
 * @param {string} mockResponse The mock object to wrap in a JSON response.
 * @return {Promise} Promise that responds to a request with the mock JSON response.
 */
export function JSONResponse( mockResponse ) {
	return async ( request ) => request.respond( getJSONResponse( mockResponse ) );
}

/**
 * Creates a function to determine if a request is calling a URL with the substring present.
 *
 * @param {string} substring The substring to check for.
 * @return {function} Function that determines if a request's URL contains substring.
 */
export function matchURL( substring ) {
	return ( request ) => -1 !== request.url().indexOf( substring );
}

/**
 * Creates a function to determine if a request has a parameter with a certain value.
 *
 * @param {string} parameterName The query parameter to check.
 * @param {string} value The value to check for.
 * @return {function} Function that determines if a request's query parameter is the specified value.
 */
export function parameterEquals( parameterName, value ) {
	return ( request ) => {
		const url = request.url();
		const match = new RegExp( `.*${ parameterName }=([^&]+).*` ).exec( url );
		if ( ! match ) {
			return false;
		}
		return value === decodeURIComponent( match[ 1 ] );
	};
}

/**
 * Get a JSON response for the passed in object, for use with `request.respond`.
 *
 * @param {Object} obj Object to seralise for response.
 * @return {Object} Response for use with `request.respond`.
 */
export function getJSONResponse( obj ) {
	return {
		content: 'application/json',
		body: JSON.stringify( obj ),
	};
}

/**
 * Mocks a request with the supplied mock object, or allows it to run with an optional transform, based on the
 * deserialised JSON response for the request.
 *
 * @param {function} mockCheck function that returns true if the request should be mocked.
 * @param {Object} mock A mock object to wrap in a JSON response, if the request should be mocked.
 * @param {function|undefined} responseObjectTransform An optional function that transforms the response's object before the response is used.
 * @return {Promise} Promise that uses `mockCheck` to see if a request should be mocked with `mock`, and optionally transforms the response with `responseObjectTransform`.
 */
export function mockOrTransform( mockCheck, mock, responseObjectTransform = ( obj ) => obj ) {
	return async ( request ) => {
		// Because we can't get the responses to requests and modify them on the fly,
		// we have to make our own request and get the response, then apply the
		// optional transform to the json encoded object.
		const response = await fetch(
			request.url(),
			{
				headers: request.headers(),
				method: request.method(),
				body: request.postData(),
			}
		);
		const responseObject = await response.json();
		if ( mockCheck( responseObject ) ) {
			request.respond( getJSONResponse( mock ) );
		} else {
			request.respond( getJSONResponse( responseObjectTransform( responseObject ) ) );
		}
	};
}

/**
 * Sets up mock checks and responses. Accepts a list of mock settings with the following properties:
 *   - match: function to check if a request should be mocked.
 *   - onRequestMatch: async function to respond to the request.
 *
 * Example:
 *   const MOCK_RESPONSES = [
 *     {
 *       match: isEmbedding( 'https://wordpress.org/gutenberg/handbook/' ),
 *       onRequestMatch: JSONResponse( MOCK_BAD_WORDPRESS_RESPONSE ),
 *     },
 *     {
 *       match: isEmbedding( 'https://wordpress.org/gutenberg/handbook/block-api/attributes/' ),
 *       onRequestMatch: JSONResponse( MOCK_EMBED_WORDPRESS_SUCCESS_RESPONSE ),
 *     }
 *  ];
 *  setUpResponseMocking( MOCK_RESPONSES );
 *
 * If none of the mock settings match the request, the request is allowed to continue.
 *
 * @param {Array} mocks Array of mock settings.
 */
export async function setUpResponseMocking( mocks ) {
	await page.setRequestInterception( true );
	page.on( 'request', async ( request ) => {
		for ( let i = 0; i < mocks.length; i++ ) {
			const mock = mocks[ i ];
			if ( mock.match( request ) ) {
				await mock.onRequestMatch( request );
				return;
			}
		}
		request.continue();
	} );
}

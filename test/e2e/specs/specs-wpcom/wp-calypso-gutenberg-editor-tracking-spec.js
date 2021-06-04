/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import WPAdminSidebar from '../../lib/pages/wp-admin/wp-admin-sidebar';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import SiteEditorPage from '../../lib/pages/site-editor-page.js';
import SiteEditorComponent from '../../lib/components/site-editor-component.js';

import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

// We need to trigger test runs against Gutenberg Edge (the "next" version of Gutenberg that
// will be deployed to Dotcom) as well as the current version of Gutenberg.
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';
const siteEditorUser = 'siteEditorSimpleSiteUser';

function getEventsFiredForBlock( eventsStack, event, block ) {
	if ( ! eventsStack || ! event || ! block ) {
		return false;
	}

	return eventsStack.filter(
		( [ eventName, eventData ] ) => event === eventName && eventData.block_name === block
	);
}

function getTotalEventsFiredForBlock( eventsStack, event, block ) {
	return getEventsFiredForBlock( eventsStack, event, block ).length;
}

async function clearEventStack() {
	// Reset e2e tests events stack after each step in order
	// that we have a test specific stack to assert against.
	await this.driver.executeScript( `window._e2eEventsStack = [];` );
}

async function testEventStackPresence() {
	await GutenbergEditorComponent.Expect( this.driver, 'wp-admin' );
	const eventsStack = await this.driver.executeScript( `return window._e2eEventsStack;` );
	// Check evaluates to truthy
	assert( eventsStack, 'Tracking events stack missing from window._e2eEventsStack' );
}

async function testRequiredAndCustomProperties() {
	const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver, 'wp-admin' );

	// Populate the event stack by inserting a few blocks
	await gEditorComponent.addBlock( 'Heading' );
	await gEditorComponent.addBlock( 'Columns' );
	await gEditorComponent.addBlock( 'Columns' );

	const eventsStack = await this.driver.executeScript( `return window._e2eEventsStack;` );

	const requiredProperties = [ 'blog_id', 'site_type', 'user_locale' ];
	const customProperties = [ 'editor_type', 'post_type' ];
	const allProperties = [ ...requiredProperties, customProperties ];
	allProperties.forEach( ( property ) => {
		eventsStack.forEach( ( [ , eventData ] ) => {
			assert.notStrictEqual( typeof eventData[ property ], undefined );
		} );
	} );
}

function testEditorAndPostTypeProps( editorType, postType ) {
	return async function testEditorAndPostTypePropsInner() {
		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver, 'wp-admin' );

		await gEditorComponent.addBlock( 'Heading' );

		const eventsStack = await this.driver.executeScript( `return window._e2eEventsStack;` );

		const lastEventData = eventsStack[ 0 ][ 1 ];
		assert.strictEqual( lastEventData.editor_type, editorType );
		assert.strictEqual( lastEventData.post_type, postType );
	};
}

describe( `[${ host }] Calypso Gutenberg Tracking: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Tracking Post Editor: @parallel', function () {
		it( 'Can log in to WPAdmin and create new Post', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );

			if ( host !== 'WPCOM' ) {
				this.loginFlow = new LoginFlow( this.driver );
			}

			await this.loginFlow.loginAndSelectWPAdmin();

			const wpadminSidebarComponent = await WPAdminSidebar.Expect( this.driver );
			await wpadminSidebarComponent.selectNewPost();
		} );

		it(
			'Check for presence of e2e specific tracking events stack on global',
			testEventStackPresence
		);

		it(
			'Make sure required and custom properties are added to the events',
			testRequiredAndCustomProperties
		);

		it(
			'`editor_type` and `post_type` property should be `post` when editing a post',
			testEditorAndPostTypeProps( 'post', 'post' )
		);

		it( 'Tracks "wpcom_block_inserted" event', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver, 'wp-admin' );

			// Insert some Blocks
			await gEditorComponent.addBlock( 'Heading' );
			await gEditorComponent.addBlock( 'Columns' );
			await gEditorComponent.addBlock( 'Columns' );

			// Grab the events stack (only present on e2e test envs).
			// see: https://github.com/Automattic/wp-calypso/pull/41329
			const eventsStack = await this.driver.executeScript( `return window._e2eEventsStack;` );

			// Assert that all block insertion events were tracked correctly
			assert.strictEqual(
				getTotalEventsFiredForBlock( eventsStack, 'wpcom_block_inserted', 'core/heading' ),
				1,
				`"wpcom_block_inserted" editor tracking event failed to fire for core/heading`
			);

			assert.strictEqual(
				getTotalEventsFiredForBlock( eventsStack, 'wpcom_block_inserted', 'core/columns' ),
				2,
				`"wpcom_block_inserted" editor tracking event failed to fire twice for core/columns`
			);
		} );

		afterEach( clearEventStack );
		after( async function () {
			await this.driver.navigate().back();
			await this.driver.wait( until.alertIsPresent() );
			const alert = await this.driver.switchTo().alert();
			await alert.accept();
		} );
	} );

	describe( 'Tracking Page Editor: @parallel', function () {
		it( 'Can open Page Editor', async function () {
			const wpadminSidebarComponent = await WPAdminSidebar.Expect( this.driver );
			await wpadminSidebarComponent.selectNewPage();

			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver, 'wp-admin' );
			await gEditorComponent.initEditor( { dismissPageTemplateLocator: true } );
		} );

		it(
			'Check for presence of e2e specific tracking events stack on global',
			testEventStackPresence
		);

		it(
			'Make sure required and custom properties are added to the events',
			testRequiredAndCustomProperties
		);

		it(
			'`editor_type` should be `post` and `post_type` property should be `page` when editing a page',
			testEditorAndPostTypeProps( 'post', 'page' )
		);

		afterEach( clearEventStack );
		after( async function () {
			await this.driver.navigate().back();
			await this.driver.wait( until.alertIsPresent() );
			const alert = await this.driver.switchTo().alert();
			await alert.accept();
			// We logout so we can login with the site editor user
			await driverManager.ensureNotLoggedIn( this.driver );
		} );
	} );

	describe( 'Tracking Site Editor: @parallel', function () {
		it( 'Site Editor opens', async function () {
			this.loginFlow = new LoginFlow( this.driver, siteEditorUser );
			await this.loginFlow.loginAndSelectMySite();

			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			await sidebarComponent.selectSiteEditor();
			await SiteEditorPage.Expect( this.driver );

			const editor = await SiteEditorComponent.Expect( this.driver );
			await editor.waitForTemplateToLoad();
			await editor.waitForTemplatePartsToLoad();
		} );

		it(
			'Check for presence of e2e specific tracking events stack on global',
			testEventStackPresence
		);

		it(
			'Make sure required and custom properties are added to the events',
			testRequiredAndCustomProperties
		);

		it(
			'`editor_type` should be `site` and `post_type` property should be `undefined` when editing a site',
			testEditorAndPostTypeProps( 'site', undefined )
		);

		afterEach( clearEventStack );
		after( async function () {
			await this.driver.switchTo().defaultContent();
		} );
	} );
} );

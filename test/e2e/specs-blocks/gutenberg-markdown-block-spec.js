/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow.js';
import MarkdownBlockComponent from '../lib/gutenberg/blocks/markdown-block-component.js';
import PostAreaComponent from '../lib/pages/frontend/post-area-component.js';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component.js';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import WPAdminJetpackModulesPage from '../lib/pages/wp-admin/wp-admin-jetpack-modules-page.js';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;
let url;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Gutenberg Markdown block: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Publish a simple post with Markdown block', function () {
		const expectedHTML = `<h3>Header</h3>
<p>Some <strong>list</strong>:</p>
<ul>
<li>item a</li>
<li>item b</li>
<li>item c</li>
</ul>
`;

		step( 'Can create wporg site and connect Jetpack', async function () {
			this.timeout( mochaTimeOut * 12 );
			const jnFlow = new JetpackConnectFlow( driver, 'jetpackConnectUser' );
			await jnFlow.connectFromWPAdmin();
			url = jnFlow.url;
		} );

		step( 'Can activate Markdown module', async function () {
			await WPAdminSidebar.refreshIfJNError( driver );
			const jetpackModulesPage = await WPAdminJetpackModulesPage.Visit(
				driver,
				WPAdminJetpackModulesPage.getPageURL( url )
			);
			await jetpackModulesPage.activateMarkdown();
			await WPAdminJetpackPage.Expect( driver );
		} );

		step( 'Can start new post', async function () {
			await WPAdminSidebar.refreshIfJNError( driver );
			const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await wpAdminSidebar.selectNewPost();
		} );

		step( 'Can insert a markdown block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver, 'wp-admin' );
			this.markdownBlockID = await gEditorComponent.addBlock( 'Markdown' );
		} );

		step( 'Can fill markdown block with content', async function () {
			this.markdownBlock = await MarkdownBlockComponent.Expect( driver, this.markdownBlockID );
			return await this.markdownBlock.setContent(
				'### Header\nSome **list**:\n\n- item a\n- item b\n- item c\n'
			);
		} );

		step( 'Can see rendered content in preview', async function () {
			await this.markdownBlock.switchPreview();
			const html = await this.markdownBlock.getPreviewHTML();
			assert.equal( html, expectedHTML );
			await this.markdownBlock.switchMarkdown();
		} );

		step( 'Can publish the post and see its content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver, 'wp-admin' );
			await gEditorComponent.publish( { visit: true } );
			const postFrontend = await PostAreaComponent.Expect( driver );
			const html = await postFrontend.getPostHTML();
			assert( html.includes( expectedHTML ) );
		} );
	} );
} );

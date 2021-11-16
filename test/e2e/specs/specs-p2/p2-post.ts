/**
 * @group p2
 */

import {
	setupHooks,
	DataHelper,
	TOTPClient,
	LoginPage,
	P2Page,
	IsolatedBlockEditorComponent,
	ParagraphBlock,
} from '@automattic/calypso-e2e';
import { ElementHandle, Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'P2: Post' ), function () {
	let page: Page;
	let blockHandle: ElementHandle;
	let p2Page: P2Page;
	let isolatedBlockEditorComponent: IsolatedBlockEditorComponent;

	const user = 'p2User';
	const postContent = DataHelper.getTimestamp();

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log In', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: user }, { landingUrl: '**/log-in/authenticator' } );

		/* Normally setup for a const will be located outside
		of the test step for organization purposes.
		However, TOTP codes are time-sensitive and so as an exception
		the setup is done within the test step.
		*/
		const totpClient = new TOTPClient( DataHelper.config.get( 'e2eflowtestingp2totp' ) );
		const code = totpClient.getToken();
		await loginPage.enter2FACode( code );
	} );

	it( 'View P2', async function () {
		await page.goto( DataHelper.getAccountSiteURL( user ), { waitUntil: 'networkidle' } );
	} );

	it( 'Add a Paragraph block', async function () {
		p2Page = new P2Page( page );
		await p2Page.focusInlineEditor();

		isolatedBlockEditorComponent = new IsolatedBlockEditorComponent( page );
		blockHandle = await isolatedBlockEditorComponent.addBlock(
			ParagraphBlock.blockName,
			ParagraphBlock.blockEditorSelector
		);
	} );

	it( 'Enter text', async function () {
		const paragraphBlock = new ParagraphBlock( blockHandle );
		await paragraphBlock.enterParagraph( postContent );
	} );

	it( 'Submit post', async function () {
		await isolatedBlockEditorComponent.submitPost();
	} );

	it( 'Validate post submission was successful', async function () {
		await p2Page.validatePostContent( postContent );
	} );
} );

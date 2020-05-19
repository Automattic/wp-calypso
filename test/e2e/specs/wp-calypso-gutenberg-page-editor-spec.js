/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import ViewPagePage from '../lib/pages/view-page-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';

import PaypalCheckoutPage from '../lib/pages/external/paypal-checkout-page';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import GutenbergEditorSidebarComponent from '../lib/gutenberg/gutenberg-editor-sidebar-component';
import PagePreviewComponent from '../lib/components/page-preview-component';
import SimplePaymentsBlockComponent from '../lib/gutenberg/blocks/payment-block-component';

import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Calypso Gutenberg Editor: Pages (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Public Pages: @parallel', function () {
		let fileDetails;
		const pageTitle = dataHelper.randomPhrase();
		const pageQuote =
			'If you have the same problem for a long time, maybe it’s not a problem. Maybe it’s a fact..\n— Itzhak Rabin';

		// Create image file for upload
		before( async function () {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			if ( host !== 'WPCOM' ) {
				this.loginFlow = new LoginFlow( driver );
			}
			return await this.loginFlow.loginAndStartNewPage( null, true );
		} );

		step( 'Can enter page title, content and image', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.enterTitle( pageTitle );
			await gEditorComponent.enterText( pageQuote );
			await gEditorComponent.addImage( fileDetails );

			await gEditorComponent.openSidebar();
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.enterImageAltText( fileDetails );
			await gEditorComponent.closeSidebar();

			const errorShown = await gEditorComponent.errorDisplayed();
			return assert.strictEqual(
				errorShown,
				false,
				'There is an error shown on the Gutenberg editor page!'
			);
		} );

		/* Skip until sharing is added in Gutenberg editor
		step( 'Can disable sharing buttons', async function() {
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.selectDocumentTab();
			await gEditorSidebarComponent.expandSharingSection();
			await gEditorSidebarComponent.setSharingButtons( false );
			await gEditorSidebarComponent.closeSharingSection();
		} );*/

		step( 'Can launch page preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct page title in preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( driver );
			await pagePreviewComponent.displayed();
			const actualPageTitle = await pagePreviewComponent.pageTitle();
			assert.strictEqual(
				actualPageTitle.toUpperCase(),
				pageTitle.toUpperCase(),
				'The page preview title is not correct'
			);
		} );

		step( 'Can see correct page content in preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( driver );
			const content = await pagePreviewComponent.pageContent();
			assert.strictEqual(
				content.indexOf( pageQuote ) > -1,
				true,
				'The page preview content (' +
					content +
					') does not include the expected content (' +
					pageQuote +
					')'
			);
		} );

		step( 'Can see the image uploaded in the preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( driver );
			const imageDisplayed = await pagePreviewComponent.imageDisplayed( fileDetails );
			return assert.strictEqual(
				imageDisplayed,
				true,
				'Could not see the image in the web preview'
			);
		} );

		step( 'Can close page preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( driver );
			await pagePreviewComponent.close();
		} );

		step( 'Can publish and preview published content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see correct page title', async function () {
			const viewPagePage = await ViewPagePage.Expect( driver );
			const actualPageTitle = await viewPagePage.pageTitle();
			assert.strictEqual(
				actualPageTitle.toUpperCase(),
				pageTitle.toUpperCase(),
				'The published blog page title is not correct'
			);
		} );

		step( 'Can see correct page content', async function () {
			const viewPagePage = await ViewPagePage.Expect( driver );
			const content = await viewPagePage.pageContent();
			assert.strictEqual(
				content.indexOf( pageQuote ) > -1,
				true,
				'The page content (' +
					content +
					') does not include the expected content (' +
					pageQuote +
					')'
			);
		} );

		/* Skip until sharing is added in Gutenberg editor
		step( "Can't see sharing buttons", async function() {
			const viewPagePage = await ViewPagePage.Expect( driver );
			let visible = await viewPagePage.sharingButtonsVisible();
			assert.strictEqual(
				visible,
				false,
				'Sharing buttons are shown even though they were disabled when creating the page.'
			);
		} ); */

		step( 'Can see the image uploaded displayed', async function () {
			const viewPagePage = await ViewPagePage.Expect( driver );
			const imageDisplayed = await viewPagePage.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the published page' );
		} );

		after( async function () {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
		} );
	} );

	describe( 'Private Pages: @parallel', function () {
		const pageTitle = dataHelper.randomPhrase();
		const pageQuote =
			'Few people know how to take a walk. The qualifications are endurance, plain clothes, old shoes, an eye for nature, good humor, vast curiosity, good speech, good silence and nothing too much.\n— Ralph Waldo Emerson';

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPage( null, true );
		} );

		step( 'Can enter page title and content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.enterTitle( pageTitle );
			await gEditorComponent.enterText( pageQuote );
			return await gEditorComponent.ensureSaved();
		} );

		step( 'Can set visibility to private which immediately publishes it', async function () {
			const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gSidebarComponent.chooseDocumentSettings();
			await gSidebarComponent.setVisibilityToPrivate();
			await gSidebarComponent.hideComponentIfNecessary();
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.waitForSuccessViewPostNotice();
		} );

		step( 'Can view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.viewPublishedPostOrPage();
		} );

		step( 'Can view page title as logged in user', async function () {
			const viewPagePage = await ViewPagePage.Expect( driver );
			const actualPageTitle = await viewPagePage.pageTitle();
			assert.strictEqual(
				actualPageTitle.toUpperCase(),
				( 'Private: ' + pageTitle ).toUpperCase(),
				'The published blog page title is not correct'
			);
		} );

		step( 'Can view page content as logged in user', async function () {
			const viewPagePage = await ViewPagePage.Expect( driver );
			const content = await viewPagePage.pageContent();
			assert.strictEqual(
				content.indexOf( pageQuote ) > -1,
				true,
				'The page content (' +
					content +
					') does not include the expected content (' +
					pageQuote +
					')'
			);
		} );

		step( "Can't view page title or content as non-logged in user", async function () {
			await driver.manage().deleteAllCookies();
			await driver.navigate().refresh();

			const notFoundPage = await NotFoundPage.Expect( driver );
			const displayed = await notFoundPage.displayed();
			assert.strictEqual(
				displayed,
				true,
				'Could not see the not found (404) page. Check that it is displayed'
			);
		} );
	} );

	describe( 'Password Protected Pages: @parallel', function () {
		const pageTitle = dataHelper.randomPhrase();
		const pageQuote =
			'If you don’t like something, change it. If you can’t change it, change the way you think about it.\n— Mary Engelbreit';
		const postPassword = 'e2e' + new Date().getTime().toString();

		describe( 'Publish a Password Protected Page', function () {
			step( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver, gutenbergUser );
				return await this.loginFlow.loginAndStartNewPage( null, true );
			} );

			step( 'Can enter page title and content and set to password protected', async function () {
				let gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.enterTitle( pageTitle );

				const errorShown = await gHeaderComponent.errorDisplayed();
				assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the Gutenberg editor page!'
				);

				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.chooseDocumentSettings();
				await gSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				await gSidebarComponent.hideComponentIfNecessary();

				gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				return await gHeaderComponent.enterText( pageQuote );
			} );

			step( 'Can publish and view content', async function () {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.publish( { visit: true } );
			} );

			step(
				'As a logged in user, With no password entered, Can view page title',
				async function () {
					const viewPagePage = await ViewPagePage.Expect( driver );
					const actualPageTitle = await viewPagePage.pageTitle();
					assert.strictEqual(
						actualPageTitle.toUpperCase(),
						( 'Protected: ' + pageTitle ).toUpperCase()
					);
				}
			);

			step( 'Can see password field', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The page does not appear to be password protected'
				);
			} );

			step( "Can't see content when no password is entered", async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const content = await viewPagePage.pageContent();
				assert.strictEqual(
					content.indexOf( pageQuote ) === -1,
					true,
					'The page content (' +
						content +
						') displays the expected content (' +
						pageQuote +
						') when it should be password protected.'
				);
			} );

			step( 'With incorrect password entered, Enter incorrect password', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				await viewPagePage.enterPassword( 'password' );
			} );

			step( 'Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			step( 'Can see password field', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The page does not appear to be password protected'
				);
			} );

			step( "Can't see content when incorrect password is entered", async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const content = await viewPagePage.pageContent();
				assert.strictEqual(
					content.indexOf( pageQuote ) === -1,
					true,
					'The page content (' +
						content +
						') displays the expected content (' +
						pageQuote +
						') when it should be password protected.'
				);
			} );

			step( 'With correct password entered, Enter correct password', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				await viewPagePage.enterPassword( postPassword );
			} );

			step( 'Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			step( "Can't see password field", async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					false,
					'The page still seems to be password protected'
				);
			} );

			step( 'Can see page content', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const content = await viewPagePage.pageContent();
				assert.strictEqual(
					content.indexOf( pageQuote ) > -1,
					true,
					'The page content (' +
						content +
						') does not include the expected content (' +
						pageQuote +
						')'
				);
			} );

			step( 'As a non-logged in user, Clear cookies (log out)', async function () {
				await driver.manage().deleteAllCookies();
				await driver.navigate().refresh();
			} );

			step( 'With no password entered, Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			step( 'Can see password field', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The page does not appear to be password protected'
				);
			} );

			step( "Can't see content when no password is entered", async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const content = await viewPagePage.pageContent();
				assert.strictEqual(
					content.indexOf( pageQuote ) === -1,
					true,
					'The page content (' +
						content +
						') displays the expected content (' +
						pageQuote +
						') when it should be password protected.'
				);
			} );

			step( 'With incorrect password entered, Enter incorrect password', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				await viewPagePage.enterPassword( 'password' );
			} );

			step( 'Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			step( 'Can see password field', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The page does not appear to be password protected'
				);
			} );

			step( "Can't see content when incorrect password is entered", async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const content = await viewPagePage.pageContent();
				assert.strictEqual(
					content.indexOf( pageQuote ) === -1,
					true,
					'The page content (' +
						content +
						') displays the expected content (' +
						pageQuote +
						') when it should be password protected.'
				);
			} );

			step( 'With correct password entered, Enter correct password', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				await viewPagePage.enterPassword( postPassword );
			} );

			step( 'Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			step( "Can't see password field", async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					false,
					'The page still seems to be password protected'
				);
			} );

			step( 'Can see page content', async function () {
				const viewPagePage = await ViewPagePage.Expect( driver );
				const content = await viewPagePage.pageContent();
				assert.strictEqual(
					content.indexOf( pageQuote ) > -1,
					true,
					'The page content (' +
						content +
						') does not include the expected content (' +
						pageQuote +
						')'
				);
			} );
		} );
	} );

	describe( 'Insert a payment button into a page: @parallel', function () {
		const paymentButtonDetails = {
			title: 'Button',
			description: 'Description',
			symbol: '¥',
			price: '980',
			currency: 'JPY',
			allowQuantity: false,
			email: 'test@wordpress.com',
		};

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPage( null, true );
		} );

		step( 'Can insert the payment button', async function () {
			const pageTitle = 'Payment Button Page: ' + dataHelper.randomPhrase();
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			const blockId = await gEditorComponent.addBlock( 'Simple Payments' );

			const gPaymentComponent = await SimplePaymentsBlockComponent.Expect( driver, blockId );
			await gPaymentComponent.insertPaymentButtonDetails( paymentButtonDetails );

			const errorShown = await gEditorComponent.errorDisplayed();
			assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );

			await gEditorComponent.enterTitle( pageTitle );
			await gEditorComponent.ensureSaved();
			return await gPaymentComponent.ensurePaymentButtonDisplayedInEditor();
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the payment button in our published page', async function () {
			const viewPagePage = await ViewPagePage.Expect( driver );
			const displayed = await viewPagePage.paymentButtonDisplayed();
			return assert.strictEqual(
				displayed,
				true,
				'The published page does not contain the payment button'
			);
		} );

		step(
			'The payment button in our published page opens a new Paypal window for payment',
			async function () {
				const numberOfOpenBrowserWindows = await driverHelper.numberOfOpenWindows( driver );
				assert.strictEqual(
					numberOfOpenBrowserWindows,
					1,
					'There is more than one open browser window before clicking payment button'
				);
				const viewPagePage = await ViewPagePage.Expect( driver );
				await viewPagePage.clickPaymentButton();
				// Skip some lines and checks until Chrome can handle multiple windows in app mode
				// await driverHelper.waitForNumberOfWindows( driver, 2 );
				// await driverHelper.switchToWindowByIndex( driver, 1 );
				await PaypalCheckoutPage.Expect( driver );
				// const amountDisplayed = await paypalCheckoutPage.priceDisplayed();
				// assert.strictEqual(
				// 	amountDisplayed,
				// 	`${ paymentButtonDetails.symbol }${ paymentButtonDetails.price } ${
				// 		paymentButtonDetails.currency
				// 	}`,
				// 	"The amount displayed on Paypal isn't correct"
				// );
				// await driverHelper.closeCurrentWindow( driver );
				// await driverHelper.switchToWindowByIndex( driver, 0 );
				// viewPagePage = await ViewPagePage.Expect( driver );
				// assert( await viewPagePage.displayed(), 'view page page is not displayed' );
			}
		);

		after( async function () {
			await driverHelper.ensurePopupsClosed( driver );
		} );
	} );

	/* Temporarily disabling this test until we smooth out the integration of Gutenberg 7.7.1 See: #40078 */

	describe.skip( 'Use the Calypso Media Modal: @parallel', function () {
		let fileDetails;

		// Create image file for upload
		before( async function () {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver, gutenbergUser );
			return await loginFlow.loginAndStartNewPage( null, true );
		} );

		step( 'Can insert an image in an Image block with the Media Modal', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.addImageFromMediaModal( fileDetails );
		} );
	} );
} );

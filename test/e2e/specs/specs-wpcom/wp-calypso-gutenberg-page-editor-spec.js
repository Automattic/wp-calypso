/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import ViewPagePage from '../../lib/pages/view-page-page.js';
import NotFoundPage from '../../lib/pages/not-found-page.js';

import PaypalCheckoutPage from '../../lib/pages/external/paypal-checkout-page';
import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import GutenbergEditorSidebarComponent from '../../lib/gutenberg/gutenberg-editor-sidebar-component';
import PagePreviewComponent from '../../lib/components/page-preview-component';
import SimplePaymentsBlockComponent from '../../lib/gutenberg/blocks/payment-block-component';

import * as driverManager from '../../lib/driver-manager.js';
import * as mediaHelper from '../../lib/media-helper.js';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverHelper from '../../lib/driver-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

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

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			if ( host !== 'WPCOM' ) {
				this.loginFlow = new LoginFlow( this.driver );
			}
			return await this.loginFlow.loginAndStartNewPage( null, true );
		} );

		it( 'Can enter page title, content and image', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.enterTitle( pageTitle );
			await gEditorComponent.enterText( pageQuote );
			await gEditorComponent.addImage( fileDetails );

			await gEditorComponent.openSidebar();
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( this.driver );
			await gEditorSidebarComponent.enterImageAltText( fileDetails );
			await gEditorComponent.closeSidebar();
		} );

		/* Skip until sharing is added in Gutenberg editor
		it( 'Can disable sharing buttons', async function() {
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.selectDocumentTab();
			await gEditorSidebarComponent.expandSharingSection();
			await gEditorSidebarComponent.setSharingButtons( false );
			await gEditorSidebarComponent.closeSharingSection();
		} );*/

		it( 'Can launch page preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.ensureSaved();
			await gEditorComponent.launchPreview();
		} );

		it( 'Can see correct page title in preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( this.driver );
			const actualPageTitle = await pagePreviewComponent.pageTitle();
			assert.strictEqual(
				actualPageTitle.toUpperCase(),
				pageTitle.toUpperCase(),
				'The page preview title is not correct'
			);
		} );

		it( 'Can see correct page content in preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( this.driver );
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

		it( 'Can see the image uploaded in the preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( this.driver );
			const imageDisplayed = await pagePreviewComponent.imageDisplayed( fileDetails );
			return assert.strictEqual(
				imageDisplayed,
				true,
				'Could not see the image in the web preview'
			);
		} );

		it( 'Can close page preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( this.driver );
			await pagePreviewComponent.close();
		} );

		it( 'Can publish and preview published content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see correct page title', async function () {
			const viewPagePage = await ViewPagePage.Expect( this.driver );
			const actualPageTitle = await viewPagePage.pageTitle();
			assert.strictEqual(
				actualPageTitle.toUpperCase(),
				pageTitle.toUpperCase(),
				'The published blog page title is not correct'
			);
		} );

		it( 'Can see correct page content', async function () {
			const viewPagePage = await ViewPagePage.Expect( this.driver );
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
		it( "Can't see sharing buttons", async function() {
			const viewPagePage = await ViewPagePage.Expect( driver );
			let visible = await viewPagePage.sharingButtonsVisible();
			assert.strictEqual(
				visible,
				false,
				'Sharing buttons are shown even though they were disabled when creating the page.'
			);
		} ); */

		it( 'Can see the image uploaded displayed', async function () {
			const viewPagePage = await ViewPagePage.Expect( this.driver );
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

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPage( null, true );
		} );

		it( 'Can enter page title and content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.enterTitle( pageTitle );
			await gEditorComponent.enterText( pageQuote );
			return await gEditorComponent.ensureSaved();
		} );

		it( 'Can set visibility to private which immediately publishes it', async function () {
			const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( this.driver );
			await gSidebarComponent.chooseDocumentSettings();
			await gSidebarComponent.setVisibilityToPrivate();
			return await gSidebarComponent.hideComponentIfNecessary();
		} );

		it( 'Can view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.viewPublishedPostOrPage();
		} );

		it( 'Can view page title as logged in user', async function () {
			const viewPagePage = await ViewPagePage.Expect( this.driver );
			const actualPageTitle = await viewPagePage.pageTitle();
			assert.strictEqual(
				actualPageTitle.toUpperCase(),
				( 'Private: ' + pageTitle ).toUpperCase(),
				'The published blog page title is not correct'
			);
		} );

		it( 'Can view page content as logged in user', async function () {
			const viewPagePage = await ViewPagePage.Expect( this.driver );
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

		it( "Can't view page title or content as non-logged in user", async function () {
			await this.driver.manage().deleteAllCookies();
			await this.driver.navigate().refresh();

			const notFoundPage = await NotFoundPage.Expect( this.driver );
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
			it( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
				return await this.loginFlow.loginAndStartNewPage( null, true );
			} );

			it( 'Can enter page title and content and set to password protected', async function () {
				let gHeaderComponent = await GutenbergEditorComponent.Expect( this.driver );
				await gHeaderComponent.enterTitle( pageTitle );

				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( this.driver );
				await gSidebarComponent.chooseDocumentSettings();
				await gSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				await gSidebarComponent.hideComponentIfNecessary();

				gHeaderComponent = await GutenbergEditorComponent.Expect( this.driver );
				return await gHeaderComponent.enterText( pageQuote );
			} );

			it( 'Can publish and view content', async function () {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( this.driver );
				await gHeaderComponent.publish( { visit: true } );
			} );

			it( 'As a logged in user, With no password entered, Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			it( 'Can see password field', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The page does not appear to be password protected'
				);
			} );

			it( "Can't see content when no password is entered", async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
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

			it( 'With incorrect password entered, Enter incorrect password', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				await viewPagePage.enterPassword( 'password' );
			} );

			it( 'Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			it( 'Can see password field', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The page does not appear to be password protected'
				);
			} );

			it( "Can't see content when incorrect password is entered", async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
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

			it( 'With correct password entered, Enter correct password', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				await viewPagePage.enterPassword( postPassword );
			} );

			it( 'Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			it( "Can't see password field", async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					false,
					'The page still seems to be password protected'
				);
			} );

			it( 'Can see page content', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
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

			it( 'As a non-logged in user, Clear cookies (log out)', async function () {
				await this.driver.manage().deleteAllCookies();
				await this.driver.navigate().refresh();
			} );

			it( 'With no password entered, Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			it( 'Can see password field', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The page does not appear to be password protected'
				);
			} );

			it( "Can't see content when no password is entered", async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
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

			it( 'With incorrect password entered, Enter incorrect password', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				await viewPagePage.enterPassword( 'password' );
			} );

			it( 'Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			it( 'Can see password field', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The page does not appear to be password protected'
				);
			} );

			it( "Can't see content when incorrect password is entered", async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
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

			it( 'With correct password entered, Enter correct password', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				await viewPagePage.enterPassword( postPassword );
			} );

			it( 'Can view page title', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const actualPageTitle = await viewPagePage.pageTitle();
				assert.strictEqual(
					actualPageTitle.toUpperCase(),
					( 'Protected: ' + pageTitle ).toUpperCase()
				);
			} );

			it( "Can't see password field", async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
				const isPasswordProtected = await viewPagePage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					false,
					'The page still seems to be password protected'
				);
			} );

			it( 'Can see page content', async function () {
				const viewPagePage = await ViewPagePage.Expect( this.driver );
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

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPage( null, true );
		} );

		it( 'Can insert the payment button', async function () {
			const pageTitle = 'Payment Button Page: ' + dataHelper.randomPhrase();
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			const blockId = await gEditorComponent.addBlock( 'Pay with PayPal' );

			const gPaymentComponent = await SimplePaymentsBlockComponent.Expect( this.driver, blockId );
			await gPaymentComponent.insertPaymentButtonDetails( paymentButtonDetails );

			await gEditorComponent.enterTitle( pageTitle );
			await gEditorComponent.ensureSaved();
			return await gPaymentComponent.ensurePaymentButtonDisplayedInEditor();
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			try {
				await gEditorComponent.publish( { visit: true } );
			} catch {
				/**
				 * Publish panel is forcibly dismissed after publishing post with a
				 * Payment button. For some reason Gutenberg detects a change to the
				 * content so we need to update it and then visit the published page.
				 *
				 * This fallback should be removed once the following is resolved:
				 *
				 * @see {@link https://github.com/Automattic/wp-calypso/issues/50302}
				 */
				await gEditorComponent.update( { visit: true } );
			}
		} );

		it( 'Can see the payment button in our published page', async function () {
			const viewPagePage = await ViewPagePage.Expect( this.driver );
			const displayed = await viewPagePage.paymentButtonDisplayed();
			return assert.strictEqual(
				displayed,
				true,
				'The published page does not contain the payment button'
			);
		} );

		it( 'The payment button in our published page opens a new Paypal window for payment', async function () {
			const numberOfOpenBrowserWindows = await driverHelper.numberOfOpenWindows( this.driver );
			assert.strictEqual(
				numberOfOpenBrowserWindows,
				1,
				'There is more than one open browser window before clicking payment button'
			);
			const viewPagePage = await ViewPagePage.Expect( this.driver );
			await viewPagePage.clickPaymentButton();
			// Skip some lines and checks until Chrome can handle multiple windows in app mode
			// await driverHelper.waitUntilAbleToSwitchToWindow( driver, 1 );
			await PaypalCheckoutPage.Expect( this.driver );
			// const amountDisplayed = await paypalCheckoutPage.priceDisplayed();
			// assert.strictEqual(
			// 	amountDisplayed,
			// 	`${ paymentButtonDetails.symbol }${ paymentButtonDetails.price } ${
			// 		paymentButtonDetails.currency
			// 	}`,
			// 	"The amount displayed on Paypal isn't correct"
			// );
			// await driverHelper.closeCurrentWindow( driver );
			// await driverHelper.waitUntilAbleToSwitchToWindow( driver, 0 );
			// viewPagePage = await ViewPagePage.Expect( driver );
			// assert( await viewPagePage.displayed(), 'view page page is not displayed' );
		} );

		after( async function () {
			await driverHelper.closeAllPopupWindows( this.driver );
		} );
	} );
} );

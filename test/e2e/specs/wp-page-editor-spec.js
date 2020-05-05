/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import ViewPagePage from '../lib/pages/view-page-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';

import PagePreviewComponent from '../lib/components/page-preview-component.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper';
import PaypalCheckoutPage from '../lib/pages/external/paypal-checkout-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Editor: Pages (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Public Pages: @parallel @jetpack', function () {
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
			const loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndStartNewPage();
		} );

		step( 'Can enter page title, content and image', async function () {
			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( pageTitle );
			await editorPage.enterContent( pageQuote + '\n' );
			await editorPage.enterPostImage( fileDetails );
			await editorPage.waitUntilImageInserted( fileDetails );
			const errorShown = await editorPage.isErrorDisplayed();
			assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Can disable sharing buttons', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.expandSharingSection();
			await postEditorSidebarComponent.setSharingButtons( false );
			await postEditorSidebarComponent.closeSharingSection();
		} );

		step( 'Can launch page preview', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.hideComponentIfNecessary();

			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.ensureSaved();
			await postEditorToolbarComponent.launchPreview();
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
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
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
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the web preview' );
		} );

		step( 'Can close page preview', async function () {
			const pagePreviewComponent = await PagePreviewComponent.Expect( driver );
			return await pagePreviewComponent.edit();
		} );

		step( 'Can view content', async function () {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.displayed();
			await postEditorToolbarComponent.viewPublishedPostOrPage();
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

		step( "Can't see sharing buttons", async function () {
			const viewPagePage = await ViewPagePage.Expect( driver );
			const visible = await viewPagePage.sharingButtonsVisible();
			assert.strictEqual(
				visible,
				false,
				'Sharing buttons are shown even though they were disabled when creating the page.'
			);
		} );

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

	describe( 'Private Pages: @parallel @jetpack', function () {
		const pageTitle = dataHelper.randomPhrase();
		const pageQuote =
			'Few people know how to take a walk. The qualifications are endurance, plain clothes, old shoes, an eye for nature, good humor, vast curiosity, good speech, good silence and nothing too much.\n— Ralph Waldo Emerson\n';

		step( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndStartNewPage();
		} );

		step( 'Can enter page title and content', async function () {
			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( pageTitle );
			await editorPage.enterContent( pageQuote );
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			return await postEditorToolbarComponent.ensureSaved();
		} );

		step( 'Can set visibility to private which immediately publishes it', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.setVisibilityToPrivate();
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			return await postEditorToolbarComponent.waitForSuccessViewPostNotice();
		} );

		if ( host === 'WPCOM' ) {
			step( 'Can view content', async function () {
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.viewPublishedPostOrPage();
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
		} else {
			// Jetpack tests
			step( 'Open published page', async function () {
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.viewPublishedPostOrPage();
			} );

			step( "Can't view page title or content as non-logged in user", async function () {
				const notFoundPage = await NotFoundPage.Expect( driver );
				const displayed = await notFoundPage.displayed();
				assert.strictEqual(
					displayed,
					true,
					'Could not see the not found (404) page. Check that it is displayed'
				);
			} );
			//TODO: Add Jetpack SSO and verify content actually published
		}
	} );

	describe( 'Password Protected Pages: @parallel @jetpack', function () {
		const pageTitle = dataHelper.randomPhrase();
		const pageQuote =
			'If you don’t like something, change it. If you can’t change it, change the way you think about it.\n— Mary Engelbreit\n';
		const postPassword = 'e2e' + new Date().getTime().toString();

		describe( 'Publish a Password Protected Page', function () {
			step( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver );
				await loginFlow.loginAndStartNewPage();
			} );

			step( 'Can enter page title and content and set to password protected', async function () {
				let editorPage = await EditorPage.Expect( driver );
				await editorPage.enterTitle( pageTitle );
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				editorPage = await EditorPage.Expect( driver );
				await editorPage.enterContent( pageQuote );
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.ensureSaved();
			} );

			step( 'Can publish and view content', async function () {
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
			} );
		} );

		describe( 'As a logged in user', function () {
			describe( 'With no password entered', function () {
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
			} );

			describe( 'With incorrect password entered', function () {
				step( 'Enter incorrect password', async function () {
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
			} );

			describe( 'With correct password entered', function () {
				step( 'Enter correct password', async function () {
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

		describe( 'As a non-logged in user', function () {
			step( 'Clear cookies (log out)', async function () {
				await driver.manage().deleteAllCookies();
				await driver.navigate().refresh();
			} );

			describe( 'With no password entered', function () {
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
			} );

			describe( 'With incorrect password entered', function () {
				step( 'Enter incorrect password', async function () {
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
			} );

			describe( 'With correct password entered', function () {
				step( 'Enter correct password', async function () {
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
	} );

	describe( 'Insert a payment button into a page: @parallel @jetpack', function () {
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
			if ( host === 'WPCOM' ) {
				return await new LoginFlow( driver ).loginAndStartNewPage();
			}
			const jetpackUrl = `jetpackpro${ host.toLowerCase() }.mystagingwebsite.com`;
			await new LoginFlow( driver, 'jetpackUserPREMIUM' ).loginAndStartNewPage( jetpackUrl );
		} );

		step( 'Can insert the payment button', async function () {
			const pageTitle = 'Payment Button Page: ' + dataHelper.randomPhrase();

			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( pageTitle );
			await editorPage.insertPaymentButton( paymentButtonDetails );

			const errorShown = await editorPage.isErrorDisplayed();
			return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Can see the payment button inserted into the visual editor', async function () {
			const editorPage = await EditorPage.Expect( driver );
			return await editorPage.ensurePaymentButtonDisplayedInPost();
		} );

		step( 'Can publish and view content', async function () {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.ensureSaved();
			await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
		} );

		step( 'Can see the payment button in our published page', async function () {
			const viewPagePage = await ViewPagePage.Expect( driver );
			const displayed = await viewPagePage.paymentButtonDisplayed();
			assert.strictEqual(
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
				//await driverHelper.waitForNumberOfWindows( driver, 2 );
				//await driverHelper.switchToWindowByIndex( driver, 1 );
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
} );

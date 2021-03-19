/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import ViewPostPage from '../lib/pages/view-post-page.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import PostPreviewComponent from '../lib/components/post-preview-component';
import SocialIconsComponent from '../lib/gutenberg/blocks/social-icons-block-component';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Social Icons Block (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;
	const socialIconsBlockSelector = By.css( '.wp-block-social-links' );
	const previewiFrameSelector = By.css( 'iframe.web-preview__frame' );

	const socialIcons = [
		{ blockName: 'Snapchat', url: 'https://www.snapchat.com/' },
		{ blockName: 'Facebook', url: 'https://www.facebook.com/AutomatticInc/' },
		{ blockName: 'Instagram', url: 'https://www.instagram.com/automattic/' },
		{ blockName: 'Twitter', url: 'https://twitter.com/automattic' },
	];

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Social Icons Block: Preview/Publish Post with OOB block', function () {
		const blogPostTitle = dataHelper.randomPhrase();

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step( 'Can insert the Social Icons block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Social Links' );

			return await driverHelper.waitTillPresentAndDisplayed( driver, socialIconsBlockSelector );
		} );

		step( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await gPostPreviewComponent.postTitle();
			return assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step( 'Can see the Social Icons block in our previewed post', async function () {
			await PostPreviewComponent.Expect( driver );
			await driver.wait(
				until.ableToSwitchToFrame( previewiFrameSelector ),
				3000,
				'Could not locate the web preview iFrame.'
			);
			return await driverHelper.waitTillPresentAndDisplayed( driver, socialIconsBlockSelector );
		} );

		step( 'Can close post preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );
			return await gPostPreviewComponent.close();
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the Social Icons block in our published post', async function () {
			await ViewPostPage.Expect( driver );
			return await driverHelper.waitTillPresentAndDisplayed( driver, socialIconsBlockSelector );
		} );
	} );

	describe( 'Social Icons Block: Configure Icons and Preview/Publish Block', function () {
		const blogPostTitle = dataHelper.randomPhrase();

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step(
			'Can insert, add and configure Social Icon Block for various Social Networks',
			async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				const blockId = await gEditorComponent.addBlock( 'Social Links' );
				const gSocialIconsComponent = await SocialIconsComponent.Expect( driver, blockId );

				for ( const icon of socialIcons ) {
					await gSocialIconsComponent.addSocialIcon( icon.blockName, icon.url );
				}

				return await driverHelper.waitTillPresentAndDisplayed( driver, socialIconsBlockSelector );
			}
		);

		step( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await gPostPreviewComponent.postTitle();
			return assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step(
			'Can see the Social Icons block and configured Icons in our previewed post',
			async function () {
				await PostPreviewComponent.Expect( driver );
				await driver.wait(
					until.ableToSwitchToFrame( previewiFrameSelector ),
					3000,
					'Could not locate the web preview iFrame.'
				);
				await driverHelper.isElementPresent( driver, socialIconsBlockSelector );
				for ( const icon of socialIcons ) {
					await driverHelper.isElementPresent(
						driver,
						By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
					);
					const url = await driver
						.findElement( By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` ) )
						.getAttribute( 'href' );
					assert.strictEqual( url, icon.url, 'Icon URL did not match URL in the previewed post' );
				}
			}
		);

		step( 'Can close post preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );
			return await gPostPreviewComponent.close();
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step(
			'Can see the Social Icons block and configured Icons in our published post',
			async function () {
				await ViewPostPage.Expect( driver );
				await driverHelper.isElementPresent( driver, socialIconsBlockSelector );

				for ( const icon of socialIcons ) {
					await driverHelper.isElementPresent(
						driver,
						By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
					);
					const url = await driver
						.findElement( By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` ) )
						.getAttribute( 'href' );
					assert.strictEqual( url, icon.url, 'Icon URL did not match URL in the published post' );
				}
			}
		);
	} );

	describe( 'Social Icons Block: Configure/Edit Icons and Preview/Publish Block', function () {
		const blogPostTitle = dataHelper.randomPhrase();
		let socialIconsBlockId;
		const updatedFacebookURL = 'https://www.facebook.com/';
		const updatedTwitterURL = 'https://www.twitter.com/';

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step(
			'Can insert, add and configure Social Icon Block for various Social Networks',
			async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				socialIconsBlockId = await gEditorComponent.addBlock( 'Social Links' );
				const gSocialIconsComponent = await SocialIconsComponent.Expect(
					driver,
					socialIconsBlockId
				);

				for ( const icon of socialIcons ) {
					await gSocialIconsComponent.addSocialIcon( icon.blockName, icon.url );
				}

				return await driverHelper.waitTillPresentAndDisplayed( driver, socialIconsBlockSelector );
			}
		);

		step( 'Can edit URLs for Facebook and Twitter', async function () {
			await GutenbergEditorComponent.Expect( driver );
			const gSocialIconsComponent = await SocialIconsComponent.Expect( driver, socialIconsBlockId );

			await gSocialIconsComponent.editSocialIconURL( 'Facebook', updatedFacebookURL );

			return await gSocialIconsComponent.editSocialIconURL( 'Twitter', updatedTwitterURL );
		} );

		step( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await gPostPreviewComponent.postTitle();
			return assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step(
			'Can see the Social Icons block, Icons and edited URLs in our previewed post',
			async function () {
				await PostPreviewComponent.Expect( driver );
				await driver.wait(
					until.ableToSwitchToFrame( previewiFrameSelector ),
					3000,
					'Could not locate the web preview iFrame.'
				);
				await driverHelper.isElementPresent( driver, socialIconsBlockSelector );
				for ( const icon of socialIcons ) {
					await driverHelper.isElementPresent(
						driver,
						By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
					);

					const url = await driver
						.findElement( By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` ) )
						.getAttribute( 'href' );

					//Check the edited URLs
					if ( icon.blockName === 'Facebook' ) {
						assert.strictEqual(
							url,
							updatedFacebookURL,
							'Icon URL did not match URL in the previewed post'
						);
					} else if ( icon.blockName === 'Twitter' ) {
						assert.strictEqual(
							url,
							updatedTwitterURL,
							'Icon URL did not match URL in the previewed post'
						);
					} else {
						assert.strictEqual( url, icon.url, 'Icon URL did not match URL in the previewed post' );
					}
				}
			}
		);

		step( 'Can close post preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );
			return await gPostPreviewComponent.close();
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step(
			'Can see the Social Icons block, Icons and edited URLs in our published post',
			async function () {
				await ViewPostPage.Expect( driver );
				await driverHelper.isElementPresent( driver, socialIconsBlockSelector );

				for ( const icon of socialIcons ) {
					await driverHelper.isElementPresent(
						driver,
						By.css( `.wp-block-social-links a[aria-label="${ icon }"]` )
					);
					const url = await driver
						.findElement( By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` ) )
						.getAttribute( 'href' );

					//Check the edited URLs
					if ( icon.blockName === 'Facebook' ) {
						assert.strictEqual(
							url,
							updatedFacebookURL,
							'Icon URL did not match URL in the previewed post'
						);
					} else if ( icon.blockName === 'Twitter' ) {
						assert.strictEqual(
							url,
							updatedTwitterURL,
							'Icon URL did not match URL in the previewed post'
						);
					} else {
						assert.strictEqual( url, icon.url, 'Icon URL did not match URL in the previewed post' );
					}
				}
			}
		);
	} );

	describe( 'Social Icons Block: Configure Icons, Delete and Preview/Publish Block', function () {
		const blogPostTitle = dataHelper.randomPhrase();
		let socialIconsBlockId;

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step(
			'Can insert, add and configure Social Icon Block for various Social Networks',
			async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				socialIconsBlockId = await gEditorComponent.addBlock( 'Social Links' );
				const gSocialIconsComponent = await SocialIconsComponent.Expect(
					driver,
					socialIconsBlockId
				);

				for ( const icon of socialIcons ) {
					await gSocialIconsComponent.addSocialIcon( icon.blockName, icon.url );
				}

				return await driverHelper.waitTillPresentAndDisplayed( driver, socialIconsBlockSelector );
			}
		);

		step( 'Can delete icons for Facebook and Twitter', async function () {
			await GutenbergEditorComponent.Expect( driver );
			const gSocialIconsComponent = await SocialIconsComponent.Expect( driver, socialIconsBlockId );

			await gSocialIconsComponent.removeSocialIcon( 'Facebook' );
			return await gSocialIconsComponent.removeSocialIcon( 'Twitter' );
		} );

		step( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await gPostPreviewComponent.postTitle();
			return assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step(
			'Can see the Social Icons block and expected Icons in our previewed post',
			async function () {
				await PostPreviewComponent.Expect( driver );
				await driver.wait(
					until.ableToSwitchToFrame( previewiFrameSelector ),
					3000,
					'Could not locate the web preview iFrame.'
				);
				await driverHelper.isElementPresent( driver, socialIconsBlockSelector );
				for ( const icon of socialIcons ) {
					if ( icon.blockName !== 'Facebook' && icon.blockName !== 'Twitter' ) {
						//Check the elements that are not deleted
						await driverHelper.isElementPresent(
							driver,
							By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
						);

						const url = await driver
							.findElement( By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` ) )
							.getAttribute( 'href' );

						assert.strictEqual( url, icon.url, 'Icon URL did not match URL in the previewed post' );
					} else {
						//Check the elements are deleted
						await driverHelper.elementIsNotPresent(
							driver,
							By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
						);
					}
				}
			}
		);

		step( 'Can close post preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );
			return await gPostPreviewComponent.close();
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step(
			'Can see the Social Icons block and expected Icons in our published post',
			async function () {
				await ViewPostPage.Expect( driver );
				await driverHelper.isElementPresent( driver, socialIconsBlockSelector );

				for ( const icon of socialIcons ) {
					if ( icon.blockName !== 'Facebook' && icon.blockName !== 'Twitter' ) {
						//Check the elements that are not deleted
						await driverHelper.isElementPresent(
							driver,
							By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
						);

						const url = await driver
							.findElement( By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` ) )
							.getAttribute( 'href' );

						assert.strictEqual( url, icon.url, 'Icon URL did not match URL in the previewed post' );
					} else {
						//Check the elements are deleted
						await driverHelper.elementIsNotPresent(
							driver,
							By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
						);
					}
				}
			}
		);
	} );

	describe( 'Social Icons Block: Configure Icons, Alignment, Size and Preview/Publish Block', function () {
		const blogPostTitle = dataHelper.randomPhrase();
		let socialIconsBlockId;

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.enterTitle( blogPostTitle );
		} );

		step(
			'Can insert, add and configure Social Icon Block for various Social Networks',
			async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				socialIconsBlockId = await gEditorComponent.addBlock( 'Social Links' );
				const gSocialIconsComponent = await SocialIconsComponent.Expect(
					driver,
					socialIconsBlockId
				);

				for ( const icon of socialIcons ) {
					await gSocialIconsComponent.addSocialIcon( icon.blockName, icon.url );
				}

				return await driverHelper.waitTillPresentAndDisplayed( driver, socialIconsBlockSelector );
			}
		);

		step( 'Can Update the Alignment of Social Icons block', async function () {
			await GutenbergEditorComponent.Expect( driver );
			const gSocialIconsComponent = await SocialIconsComponent.Expect( driver, socialIconsBlockId );

			return await gSocialIconsComponent.setAlignment( 'Align left' );
		} );

		step( 'Can Update the Size of Social Icons block', async function () {
			await GutenbergEditorComponent.Expect( driver );
			const gSocialIconsComponent = await SocialIconsComponent.Expect( driver, socialIconsBlockId );

			return await gSocialIconsComponent.setSize( 'Huge' );
		} );

		step( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await gPostPreviewComponent.postTitle();
			return assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step(
			'Can see the Social Icons block and configured Icons in our previewed post',
			async function () {
				await PostPreviewComponent.Expect( driver );
				await driver.wait(
					until.ableToSwitchToFrame( previewiFrameSelector ),
					3000,
					'Could not locate the web preview iFrame.'
				);
				await driverHelper.isElementPresent( driver, socialIconsBlockSelector );
				for ( const icon of socialIcons ) {
					await driverHelper.isElementPresent(
						driver,
						By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
					);
					const url = await driver
						.findElement( By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` ) )
						.getAttribute( 'href' );
					assert.strictEqual( url, icon.url, 'Icon URL did not match URL in the previewed post' );
				}
			}
		);

		step( 'Can see the Correct Alignment in Previewed Post', async function () {
			await PostPreviewComponent.Expect( driver );
			await driver.wait(
				until.ableToSwitchToFrame( previewiFrameSelector ),
				3000,
				'Could not locate the web preview iFrame.'
			);
			await driverHelper.isElementPresent( driver, By.css( 'ul.wp-block-social-links.alignleft' ) );
		} );

		step( 'Can see the Correct Size in Previewed Post', async function () {
			await PostPreviewComponent.Expect( driver );
			await driver.wait(
				until.ableToSwitchToFrame( previewiFrameSelector ),
				3000,
				'Could not locate the web preview iFrame.'
			);
			await driverHelper.isElementPresent(
				driver,
				By.css( 'ul.wp-block-social-links.has-huge-icon-size' )
			);
		} );

		step( 'Can close post preview', async function () {
			const gPostPreviewComponent = await PostPreviewComponent.Expect( driver );
			return await gPostPreviewComponent.close();
		} );

		step( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step(
			'Can see the Social Icons block and configured Icons in our published post',
			async function () {
				await ViewPostPage.Expect( driver );
				await driverHelper.isElementPresent( driver, socialIconsBlockSelector );

				for ( const icon of socialIcons ) {
					await driverHelper.isElementPresent(
						driver,
						By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` )
					);
					const url = await driver
						.findElement( By.css( `.wp-block-social-links a[aria-label="${ icon.blockName }"]` ) )
						.getAttribute( 'href' );
					assert.strictEqual( url, icon.url, 'Icon URL did not match URL in the published post' );
				}
			}
		);

		step( 'Can see the Correct Alignment in Published Post', async function () {
			await ViewPostPage.Expect( driver );
			await driverHelper.isElementPresent( driver, By.css( 'ul.alignleft' ) );
		} );

		step( 'Can see the Correct Size in Published Post', async function () {
			await ViewPostPage.Expect( driver );
			await driverHelper.isElementPresent( driver, By.css( 'ul.has-huge-icon-size' ) );
		} );
	} );
} );

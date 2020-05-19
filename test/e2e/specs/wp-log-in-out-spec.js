/**
 * External dependencies
 */
import assert from 'assert';
import { get } from 'lodash';
import speakeasy from 'speakeasy';
import config from 'config';

/**
 * External dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import EmailClient from '../lib/email-client.js';
import { listenForSMS } from '../lib/xmpp-client';
import { subscribeToPush, approvePushToken } from '../lib/push-client';
import ReaderPage from '../lib/pages/reader-page';
import ProfilePage from '../lib/pages/profile-page';
import WPHomePage from '../lib/pages/wp-home-page';
import MagicLoginPage from '../lib/pages/magic-login-page';

import NavBarComponent from '../lib/components/nav-bar-component.js';
import LoggedOutMasterbarComponent from '../lib/components/logged-out-masterbar-component';

import LoginFlow from '../lib/flows/login-flow';
import LoginPage from '../lib/pages/login-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Auth Screen Canary: (${ screenSize }) @parallel @safaricanary`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Loading the log-in screen', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can see the log in screen', async function () {
			await LoginPage.Visit( driver, LoginPage.getLoginURL() );
		} );
	} );
} );

describe( `[${ host }] Authentication: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Logging In and Out: @jetpack', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		describe( 'Can Log In', function () {
			step( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver );
				await loginFlow.login( { useFreshLogin: true } );
			} );

			step( 'Can see Reader Page after logging in', async function () {
				return await ReaderPage.Expect( driver );
			} );
		} );

		// Test Jetpack SSO
		if ( host !== 'WPCOM' ) {
			describe( 'Can Log via Jetpack SSO', function () {
				step( 'Can log into site via Jetpack SSO', async function () {
					const loginPage = await WPAdminLogonPage.Visit( driver, dataHelper.getJetpackSiteName() );
					return await loginPage.logonSSO();
				} );

				step( 'Can return to Reader', async function () {
					return await ReaderPage.Visit( driver );
				} );
			} );
		}

		describe( 'Can Log Out', function () {
			step( 'Can view profile to log out', async function () {
				const navbarComponent = await NavBarComponent.Expect( driver );
				await navbarComponent.clickProfileLink();
			} );

			step( 'Can logout from profile page', async function () {
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.clickSignOut();
			} );

			step( 'Can see wordpress.com home when after logging out', async function () {
				return await LoggedOutMasterbarComponent.Expect( driver );
			} );
		} );
	} );

	if (
		dataHelper.hasAccountWithFeatures( '+2fa-sms -passwordless' ) &&
		! dataHelper.isRunningOnLiveBranch()
	) {
		describe( 'Can Log in on a 2fa account @secure-auth', function () {
			let loginFlow, twoFALoginPage, twoFACode;

			before( async function () {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			before( async function () {
				loginFlow = new LoginFlow( driver, [ '+2fa-sms', '-passwordless' ] );
				// make sure we listen for SMS before we trigger any
				const xmppClient = listenForSMS( loginFlow.account );
				return await new Promise( ( resolve, reject ) => {
					xmppClient.once( 'e2e:ready', async () => {
						// send sms now!
						await loginFlow.login( { useFreshLogin: true } );
						twoFALoginPage = new LoginPage( driver );
						twoFALoginPage.use2FAMethod( 'sms' );
					} );
					xmppClient.on( 'e2e:sms', function ( sms ) {
						const twoFACodeMatches = sms.body.match( /\d+/g );
						twoFACode = twoFACodeMatches[ 0 ];
						if ( twoFACode ) {
							xmppClient.stop();
							resolve();
						}
					} );
					xmppClient.on( 'error', reject );
				} );
			} );

			step( 'Should be on the /log-in/sms page', async function () {
				await twoFALoginPage.displayed();
				const urlDisplayed = await driver.getCurrentUrl();

				assert(
					urlDisplayed.indexOf( '/log-in/sms' ) !== -1,
					'The 2fa sms page is not displayed after log in'
				);
			} );

			step( "Enter the 2fa code and we're logged in", async function () {
				return await twoFALoginPage.enter2FACode( twoFACode );
			} );
		} );
	}

	if (
		dataHelper.hasAccountWithFeatures( '+2fa-push -passwordless' ) &&
		! dataHelper.isRunningOnLiveBranch()
	) {
		describe( 'Can Log in on with 2fa push account @secure-auth', function () {
			let loginFlow, twoFALoginPage;

			before( async function () {
				await driverManager.ensureNotLoggedIn( driver );
				loginFlow = new LoginFlow( driver, [ '+2fa-push', '-passwordless' ] );
				await loginFlow.login( { useFreshLogin: true } );
				twoFALoginPage = new LoginPage( driver );
			} );

			step( 'Should be on the /log-in/push page', async function () {
				await twoFALoginPage.displayed();
				const urlDisplayed = await driver.getCurrentUrl();
				assert(
					urlDisplayed.indexOf( '/log-in/push' ) !== -1,
					'The 2fa push page is not displayed after log in'
				);
			} );

			step( "Approve push 2fa token and we're logged in", async function () {
				await subscribeToPush( loginFlow.account.pushConfig, async ( pushToken ) => {
					await approvePushToken( pushToken, loginFlow.account.bearerToken );
					const readerPage = new ReaderPage( driver );
					const displayed = await readerPage.displayed();
					assert.strictEqual( displayed, true, 'The reader page is not displayed after log in' );
				} );
			} );
		} );
	}

	if (
		dataHelper.hasAccountWithFeatures( '+2fa-otp -passwordless' ) &&
		! dataHelper.isRunningOnLiveBranch()
	) {
		describe( 'Can Log in on a 2fa account @secure-auth', function () {
			let loginFlow, twoFALoginPage;

			before( async function () {
				await driverManager.ensureNotLoggedIn( driver );
				loginFlow = new LoginFlow( driver, [ '+2fa-otp', '-passwordless' ] );
				await loginFlow.login( { useFreshLogin: true } );
				twoFALoginPage = new LoginPage( driver );
				return twoFALoginPage.use2FAMethod( 'otp' );
			} );

			step( 'Should be on the /log-in/authenticator page', async function () {
				await twoFALoginPage.displayed();
				const urlDisplayed = await driver.getCurrentUrl();
				assert(
					urlDisplayed.indexOf( '/log-in/authenticator' ) !== -1,
					'The 2fa authenticator page is not displayed after log in'
				);
			} );

			step( "Enter the 2fa code and we're logged in", async function () {
				const twoFACode = speakeasy.totp( {
					secret: loginFlow.account[ '2faOTPsecret' ],
					encoding: 'base32',
				} );
				return await twoFALoginPage.enter2FACode( twoFACode );
			} );
		} );
	}

	if (
		dataHelper.hasAccountWithFeatures( '+passwordless -2fa' ) &&
		! dataHelper.isRunningOnLiveBranch()
	) {
		describe( 'Can Log in on a passwordless account @secure-auth', function () {
			before( async function () {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			describe( 'Can request a magic link email by entering the email of an account which does not have a password defined', function () {
				let magicLoginLink, loginFlow, magicLinkEmail, emailClient;
				before( async function () {
					loginFlow = new LoginFlow( driver, [ '+passwordless', '-2fa' ] );
					emailClient = new EmailClient( get( loginFlow.account, 'mailosaur.inboxId' ) );
					return await loginFlow.login( { emailSSO: true, useFreshLogin: true } );
				} );

				step( 'Can find the magic link in the email received', async function () {
					const emails = await emailClient.pollEmailsByRecipient( loginFlow.account.email );
					magicLinkEmail = emails.find(
						( email ) => email.subject.indexOf( 'WordPress.com' ) > -1
					);
					assert( magicLinkEmail !== undefined, 'Could not find the magic login email' );
					magicLoginLink = magicLinkEmail.html.links[ 0 ].href;
					assert(
						magicLoginLink !== undefined,
						'Could not locate the magic login link in the email'
					);
				} );

				describe( 'Can use the magic link to log in', function () {
					let magicLoginPage;
					step( "Visit the magic link and we're logged in", async function () {
						driver.get( magicLoginLink );
						magicLoginPage = new MagicLoginPage( driver );
						await magicLoginPage.finishLogin();
						const readerPage = new ReaderPage( driver );
						const displayed = await readerPage.displayed();
						assert.strictEqual( displayed, true, 'The reader page is not displayed after log in' );
					} );

					// we should always remove a magic link email once the magic link has been used (even if login failed)
					after( async function () {
						if ( magicLinkEmail ) {
							return await emailClient.deleteAllEmailByID( magicLinkEmail.id );
						}
					} );
				} );

				after( function () {
					if ( loginFlow ) {
						loginFlow.end();
					}
				} );
			} );
		} );
	}

	if (
		dataHelper.hasAccountWithFeatures( '+passwordless +2fa-sms' ) &&
		! dataHelper.isRunningOnLiveBranch()
	) {
		describe( 'Can Log in on a passwordless account with 2fa using sms @secure-auth', function () {
			before( async function () {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			describe( 'Can request a magic link email by entering the email of an account which does not have a password defined', function () {
				let magicLoginLink, loginFlow, magicLinkEmail, emailClient;
				before( async function () {
					loginFlow = new LoginFlow( driver, [ '+passwordless', '+2fa-sms' ] );
					emailClient = new EmailClient( get( loginFlow.account, 'mailosaur.inboxId' ) );
					return await loginFlow.login( { emailSSO: true } );
				} );

				step( 'Can find the magic link in the email received', async function () {
					const emails = await emailClient.pollEmailsByRecipient( loginFlow.account.email );
					magicLinkEmail = emails.find(
						( email ) => email.subject.indexOf( 'WordPress.com' ) > -1
					);
					assert( magicLinkEmail !== undefined, 'Could not find the magic login email' );
					magicLoginLink = magicLinkEmail.html.links[ 0 ].href;
					assert(
						magicLoginLink !== undefined,
						'Could not locate the magic login link in the email'
					);
				} );

				describe( 'Can use the magic link and the code received via sms to log in', function () {
					let magicLoginPage, twoFALoginPage, twoFACode;
					before( async function () {
						await driver.get( magicLoginLink );
						magicLoginPage = new MagicLoginPage( driver );
						// make sure we listen for SMS before we trigger any
						const xmppClient = listenForSMS( loginFlow.account );
						return await new Promise( ( resolve, reject ) => {
							xmppClient.once( 'e2e:ready', async () => {
								// send sms now!
								await magicLoginPage.finishLogin();
								twoFALoginPage = new LoginPage( driver );
								twoFALoginPage.use2FAMethod( 'sms' );
							} );
							xmppClient.on( 'e2e:sms', function ( sms ) {
								const twoFACodeMatches = sms.body.match( /\d+/g );
								twoFACode = twoFACodeMatches[ 0 ];
								if ( twoFACode ) {
									xmppClient.stop();
									resolve();
								}
							} );
							xmppClient.on( 'error', function () {
								reject();
							} );
						} );
					} );

					step( 'Should be on the /log-in/sms page', async function () {
						await twoFALoginPage.displayed();
						const urlDisplayed = await driver.getCurrentUrl();

						assert(
							urlDisplayed.indexOf( '/log-in/sms' ) !== -1,
							'The 2fa sms page is not displayed after log in'
						);
					} );

					step( "Enter the 2fa code and we're logged in", async function () {
						return await twoFALoginPage.enter2FACode( twoFACode );
					} );

					// we should always remove a magic link email once the magic link has been used (even if login failed)
					after( async function () {
						if ( magicLinkEmail ) {
							return await emailClient.deleteAllEmailByID( magicLinkEmail.id );
						}
					} );
				} );

				after( function () {
					if ( loginFlow ) {
						loginFlow.end();
					}
				} );
			} );
		} );
	}

	if (
		dataHelper.hasAccountWithFeatures( '+passwordless +2fa-otp' ) &&
		! dataHelper.isRunningOnLiveBranch()
	) {
		describe( 'Can Log in on a passwordless account with 2fa using authenticator @secure-auth', function () {
			before( async function () {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			describe( 'Can request a magic link email by entering the email of an account which does not have a password defined', function () {
				let magicLoginLink, loginFlow, magicLinkEmail, emailClient;
				before( async function () {
					loginFlow = new LoginFlow( driver, [ '+passwordless', '+2fa-sms' ] );
					emailClient = new EmailClient( get( loginFlow.account, 'mailosaur.inboxId' ) );
					return await loginFlow.login( { emailSSO: true } );
				} );

				step( 'Can find the magic link in the email received', async function () {
					const emails = await emailClient.pollEmailsByRecipient( loginFlow.account.email );
					magicLinkEmail = emails.find(
						( email ) => email.subject.indexOf( 'WordPress.com' ) > -1
					);
					assert( magicLinkEmail !== undefined, 'Could not find the magic login email' );
					magicLoginLink = magicLinkEmail.html.links[ 0 ].href;
					assert(
						magicLoginLink !== undefined,
						'Could not locate the magic login link in the email'
					);
				} );

				describe( 'Can use the magic link and the code received via sms to log in', function () {
					let magicLoginPage, twoFALoginPage;
					before( async function () {
						driver.get( magicLoginLink );
						magicLoginPage = new MagicLoginPage( driver );
						await magicLoginPage.finishLogin();
						twoFALoginPage = new LoginPage( driver );
						return await twoFALoginPage.use2FAMethod( 'otp' );
					} );

					step( 'Should be on the /log-in/authenticator page', async function () {
						await twoFALoginPage.displayed();
						const urlDisplayed = await driver.getCurrentUrl();
						assert(
							urlDisplayed.indexOf( '/log-in/authenticator' ) !== -1,
							'The 2fa authenticator page is not displayed after log in'
						);
					} );

					step( "Enter the 2fa code and we're logged in", async function () {
						const twoFACode = speakeasy.totp( {
							secret: loginFlow.account[ '2faOTPsecret' ],
							encoding: 'base32',
						} );
						return await twoFALoginPage.enter2FACode( twoFACode );
					} );

					// we should always remove a magic link email once the magic link has been used (even if login failed)
					after( async function () {
						if ( magicLinkEmail ) {
							return await emailClient.deleteAllEmailByID( magicLinkEmail.id );
						}
					} );
				} );

				after( function () {
					if ( loginFlow ) {
						loginFlow.end();
					}
				} );
			} );
		} );
	}
} );

describe( `[${ host }] User Agent: (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.ensureNotLoggedIn( driver );
	} );

	step( 'Can see the correct user agent set', async function () {
		await WPHomePage.Visit( driver );
		const userAgent = await driver.executeScript( 'return navigator.userAgent;' );
		assert(
			userAgent.match( 'wp-e2e-tests' ),
			`User Agent does not contain 'wp-e2e-tests'.  [${ userAgent }]`
		);
	} );
} );

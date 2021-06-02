/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import chrome from 'selenium-webdriver/chrome';
import chromedriver from 'chromedriver';
import config from 'config';
import proxy from 'selenium-webdriver/proxy';
import SauceLabs from 'saucelabs';
import { times } from 'lodash';
import { getChromeVersion } from '@testim/chrome-version';
import * as remote from 'selenium-webdriver/remote';

/**
 * Internal dependencies
 */
import { generatePath } from './test-utils';
import * as dataHelper from './data-helper';

const webDriverImplicitTimeOutMS = 2000;
const webDriverPageLoadTimeOutMS = 60000;
const browser = config.get( 'browser' );

export function currentScreenSize() {
	let screenSize = process.env.BROWSERSIZE;
	if ( screenSize === undefined || screenSize === '' ) {
		screenSize = 'desktop';
	}
	return screenSize.toLowerCase();
}

export function currentLocale() {
	let locale = process.env.BROWSERLOCALE;
	if ( locale === undefined || locale === '' ) {
		locale = 'en';
	}
	return locale.toLowerCase();
}

export function getSizeAsObject() {
	switch ( currentScreenSize() ) {
		case 'mobile':
			return { width: 400, height: 1000 };
		case 'tablet':
			return { width: 1024, height: 1000 };
		case 'desktop':
			return { width: 1440, height: 1000 };
		case 'laptop':
			return { width: 1400, height: 790 };
		default:
			throw new Error(
				'Unsupported screen size specified. Supported values are desktop, tablet and mobile.'
			);
	}
}

export function getProxyType() {
	const proxyType = config.get( 'proxy' );
	switch ( proxyType.toLowerCase() ) {
		case 'direct':
			return proxy.direct();
		case 'system':
			return proxy.system();
		case 'charles':
			return proxy.manual( { http: 'localhost:8888', https: 'localhost:8888' } );
		default:
			throw new Error(
				`Unknown proxy type specified of: '${ proxyType }'. Supported values are 'direct', 'system', or 'charles'`
			);
	}
}

/**
 * This proxy is meant to only catch & re-throw internal driver.wait() errors
 * ("Waiting for ... timed out.") in order to provide a full stack to the
 * relevant line. Without it, the stack provides merely a single line to the
 * webdriver.js source.
 *
 * @param {webdriver.ThenableWebDriver} twd A ThenableWebDriver instance
 * @returns {webdriver.WebDriver} A WebDriver instance
 */
export async function createDriverProxy( twd ) {
	const driver = await twd;

	return new Proxy( driver, {
		get: function ( target, prop ) {
			const orig = target[ prop ];
			if ( 'function' !== typeof orig ) {
				return orig;
			}

			if ( 'wait' === prop ) {
				return async function ( ...args ) {
					try {
						const result = await orig.apply( target, args );
						return result;
					} catch ( error ) {
						if ( error instanceof webdriver.error.TimeoutError ) {
							/**
							 * By re-throwing the same error we're only replacing its stack.
							 * The message will stay the same.
							 */
							throw new Error( error );
						}

						throw error;
					}
				};
			}

			return orig.bind( target );
		},
	} );
}

export async function startBrowser( {
	useCustomUA = true,
	resizeBrowserWindow = true,
	disableThirdPartyCookies = false,
} = {} ) {
	const screenSize = currentScreenSize();
	const locale = currentLocale();
	let driver;
	let options;
	let builder;
	const userAgent = `user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ await getChromeVersion() } Safari/537.36`;
	const pref = new webdriver.logging.Preferences();
	pref.setLevel( webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL );
	pref.setLevel( webdriver.logging.Type.PERFORMANCE, webdriver.logging.Level.ALL );

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		const sauceURL = 'http://ondemand.saucelabs.com:80/wd/hub';
		const sauceConfig = config.get( 'sauceConfig' );
		const caps = config.get( 'sauceConfigurations' )[ sauceConfig ];
		builder = new webdriver.Builder();

		caps.username = config.get( 'sauceUsername' );
		caps.accessKey = config.get( 'sauceAccessKey' );
		caps.name = caps.browserName + ' - [' + screenSize + ']';
		caps.maxDuration = 2700; // 45 minutes

		if ( caps.platform.match( /Windows/ ) ) {
			caps.prerun = {
				executable:
					'https://raw.githubusercontent.com/Automattic/wp-e2e-tests/master/scripts/fix-saucelabs-etc-hosts.bat',
			};
		} else {
			caps.prerun = {
				executable:
					'https://raw.githubusercontent.com/Automattic/wp-e2e-tests/master/scripts/fix-saucelabs-etc-hosts.sh',
			};
		}
		if ( process.env.CIRCLE_BUILD_NUM ) {
			caps.name += ' - CircleCI Build #' + process.env.CIRCLE_BUILD_NUM;
		}
		if ( caps.browserName === 'chrome' ) {
			options = new chrome.Options();
			options.addArguments( '--app=https://www.wordpress.com' );
			options.addArguments( userAgent );
			builder.setChromeOptions( options );
		}

		global._sauceLabs = new SauceLabs( {
			username: caps.username,
			password: caps.accessKey,
		} );

		global.browserName = caps.browserName;
		driver = builder.usingServer( sauceURL ).withCapabilities( caps ).build();

		driver.setFileDetector( new remote.FileDetector() );

		driver.getSession().then( function ( sessionid ) {
			driver.allPassed = true;
			driver.sessionID = sessionid.id_;
		} );
	} else {
		switch ( browser.toLowerCase() ) {
			case 'chrome':
				options = new chrome.Options();
				// eslint-disable-next-line no-case-declarations
				const prefs = {
					enable_do_not_track: true,
					credentials_enable_service: false,
					intl: { accept_languages: locale },
					profile: {
						// 1 = allow all cookies (default), 2 = block all cookies
						default_content_setting_values: { cookies: 1 },
						block_third_party_cookies: false, // For chrome v84. (ci)
						// 0 = allow 3pc, 1 = block 3pc, 2 = block 3pc in incognito (default)
						cookie_controls_mode: 2, // For chrome v90.
					},
				};

				if ( disableThirdPartyCookies ) {
					prefs.profile.cookie_controls_mode = 1;
					prefs.profile.block_third_party_cookies = true;
				}

				options.setUserPreferences( prefs );
				options.setProxy( getProxyType() );
				options.addArguments( '--no-first-run' );
				options.addArguments( '--no-sandbox' );

				if ( useCustomUA ) {
					options.addArguments( userAgent );
				}
				if (
					process.env.HEADLESS ||
					( config.has( 'headless' ) && config.get( 'headless' ) === 'true' )
				) {
					options.addArguments( '--headless' );
					global.isHeadless = true;
				}

				if ( global.displayNum ) {
					// Do not update spacing in the variable below. It will break test video
					// prettier-ignore
					options.addArguments( `--display=:${global.displayNum}` );
				}

				options.addArguments( '--app=https://www.wordpress.com' );

				// eslint-disable-next-line no-case-declarations
				const service = new chrome.ServiceBuilder( chromedriver.path )
					.loggingTo( generatePath( 'chromedriver.log' ) )
					.build();
				chrome.setDefaultService( service );
				options.setChromeLogFile( generatePath( './chrome.log' ) );
				options.addArguments( '--enable-logging' );

				builder = new webdriver.Builder();
				builder.setChromeOptions( options );
				driver = builder.forBrowser( 'chrome' ).setLoggingPrefs( pref ).build();
				global.browserName = 'chrome';
				break;
			case 'firefox':
				const profile = new firefox.Profile(); // eslint-disable-line no-case-declarations
				profile.setNativeEventsEnabled( true );
				profile.setPreference( 'browser.startup.homepage_override.mstone', 'ignore' );
				profile.setPreference( 'browser.startup.homepage', 'about:blank' );
				profile.setPreference( 'startup.homepage_welcome_url.additional', 'about:blank' );
				profile.setPreference( 'intl.accept_languages', locale );
				if ( disableThirdPartyCookies ) {
					profile.setPreference( 'network.cookie.cookieBehavior', 2 );
				}
				if ( useCustomUA ) {
					profile.setPreference(
						'general.useragent.override',
						'Mozilla/5.0 (wp-e2e-tests) Gecko/20100101 Firefox/46.0'
					);
				}

				options = new firefox.Options().setProfile( profile );
				options.setProxy( getProxyType() );
				builder = new webdriver.Builder();
				builder.setFirefoxOptions( options );
				driver = builder.forBrowser( 'firefox' ).setLoggingPrefs( pref ).build();
				global.browserName = 'firefox';
				break;
			default:
				throw new Error(
					`The specified browser: '${ browser }' in the config is not supported. Supported browsers are 'chrome' and 'firefox'`
				);
		}
	}
	await driver
		.manage()
		.setTimeouts( { implicit: webDriverImplicitTimeOutMS, pageLoad: webDriverPageLoadTimeOutMS } );
	if ( resizeBrowserWindow ) {
		await resizeBrowser( driver, screenSize );
	}

	return createDriverProxy( driver );
}

export async function resizeBrowser( driver, screenSize ) {
	if ( typeof screenSize === 'string' ) {
		switch ( screenSize.toLowerCase() ) {
			case 'mobile':
				await driver.manage().window().setRect( { x: 0, y: 0, width: 400, height: 1000 } );
				break;
			case 'tablet':
				await driver.manage().window().setRect( { x: 0, y: 0, width: 1024, height: 1000 } );
				break;
			case 'desktop':
				await driver.manage().window().setRect( { x: 0, y: 0, width: 1440, height: 1000 } );
				break;
			case 'laptop':
				await driver.manage().window().setRect( { x: 0, y: 0, width: 1400, height: 790 } );
				break;
			default:
				throw new Error(
					'Unsupported screen size specified (' +
						screenSize +
						'). Supported values are desktop, tablet and mobile.'
				);
		}
	} else {
		throw new Error(
			'Unsupported screen size specified (' +
				screenSize +
				'). Supported values are desktop, tablet and mobile.'
		);
	}
}

export async function clearCookiesAndDeleteLocalStorage( driver, siteURL = null ) {
	if ( siteURL ) {
		await driver.get( siteURL );
	}
	const url = await driver.getCurrentUrl();
	await driver.manage().deleteAllCookies();
	if ( url.startsWith( 'data:' ) === false && url !== 'about:blank' ) {
		return deleteLocalStorage( driver );
	}
}

export function deleteLocalStorage( driver ) {
	return driver.executeScript( 'window.localStorage.clear();' );
}

export async function ensureNotLoggedIn( driver ) {
	// This makes sure neither auth domain or local domain has any cookies or local storage
	const calypsoURL = dataHelper.configGet( 'calypsoBaseURL' );
	const wordPressDotComURL = 'https://wordpress.com';

	await driver.sleep( 2000 ); // wait before clearing data

	if ( calypsoURL !== wordPressDotComURL ) {
		await driver.get( wordPressDotComURL );
		await clearCookiesAndDeleteLocalStorage( driver );
	}
	await driver.get( calypsoURL );
	await clearCookiesAndDeleteLocalStorage( driver );

	// Set cookie to prevent GDPR banner from appearing
	if ( dataHelper.isRunningOnLiveBranch() ) {
		await driver.executeScript( 'window.document.cookie = "sensitive_pixel_option=no;";' );
	}

	await driver.executeScript(
		'window.document.cookie = "sensitive_pixel_option=no;domain=.wordpress.com;SameSite=None;Secure"'
	);

	await driver.sleep( 500 );
}

/**
 * Ensure a user isn't logged into wordpress.com, remote-login, or the given test site url.
 *
 * Clearing cookies on each site ensures a login step is required for popup based logins.
 *
 * @param driver Webdriver
 * @param siteUrl to clear cookies from
 */
export async function ensureNotLoggedIntoSite( driver, siteUrl = false ) {
	await ensureNotLoggedIn( driver ); // Clear wpcom/calypso cookies
	await clearCookiesAndDeleteLocalStorage( driver, 'https://r-login.wordpress.com/' ); // Clear cookies on remote login
	if ( siteUrl ) {
		await clearCookiesAndDeleteLocalStorage( driver, siteUrl ); // Clear cookies on url
	}
}

export async function dismissAllAlerts( driver ) {
	await times( 3, async () => {
		try {
			await driver.get( 'data:,' );
		} catch ( err ) {
			await driver.sleep( 2000 );
			console.log( `Accepting an open alert: '${ err }'` );
			const alert = await driver.switchTo().alert();
			await alert.dismiss();
		}
	} );
}

export async function acceptAllAlerts( driver ) {
	await times( 3, async () => {
		try {
			await driver.get( 'data:,' );
		} catch ( err ) {
			await driver.sleep( 2000 );
			console.log( `Accepting an open alert: '${ err }'` );
			const alert = await driver.switchTo().alert();
			await alert.accept();
		}
	} );
}

export function quitBrowser( driver ) {
	return driver.quit();
}

export function enableDebugMode( driver ) {
	driver.executeScript( 'window.localStorage.debug="*";' );
}

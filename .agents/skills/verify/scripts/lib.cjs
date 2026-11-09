const fs = require( 'node:fs' );
const os = require( 'node:os' );
const path = require( 'node:path' );
const { createRequire } = require( 'node:module' );

const REPO_ROOT = path.resolve( __dirname, '../../../..' );
const e2eRequire = createRequire( path.join( REPO_ROOT, 'test/e2e/package.json' ) );

e2eRequire( 'dotenv' ).config( { path: path.join( REPO_ROOT, '.env' ), quiet: true } );

const PORT = process.env.PORT || 3000;
const OWN_ACCOUNT = 'me';
const AUTH_COMMAND = `node .agents/skills/verify/scripts/auth.cjs ${ OWN_ACCOUNT }`;
const SETUP_COMMAND = '.agents/skills/verify/scripts/setup-test-accounts.sh';
const STATE_DIR = path.join(
	process.env.XDG_STATE_HOME || path.join( os.homedir(), '.local/state' ),
	'wp-calypso-verify'
);

class UserActionRequired extends Error {}

function statePath( account ) {
	return path.join( STATE_DIR, `${ account }.json` );
}

function isLoginUrl( url ) {
	return /\/log-in(?:[/?#]|$)|\/wp-login\.php/.test( url );
}

async function launchBrowser( options ) {
	const { chromium } = e2eRequire( 'playwright' );
	try {
		return await chromium.launch( options );
	} catch ( error ) {
		if ( /Executable doesn't exist/.test( error.message ) ) {
			throw new UserActionRequired(
				"Playwright's Chromium isn't installed. Ask the user to run: " +
					'(cd test/e2e && npx playwright install chromium)'
			);
		}
		throw error;
	}
}

/**
 * Saves the context's cookies so later runs can reuse the session.
 *
 * Locally, the app reaches the API through a public-api.wordpress.com iframe embedded in
 * a *.localhost page. That's a cross-site context, so Chromium withholds the session
 * cookies, which wordpress.com sets as SameSite=Lax, and the app bounces to the login page.
 */
async function saveState( context, account ) {
	const state = await context.storageState();
	for ( const cookie of state.cookies ) {
		if ( /(^|\.)wordpress\.com$/.test( cookie.domain ) ) {
			cookie.sameSite = 'None';
			cookie.secure = true;
		}
	}
	fs.mkdirSync( STATE_DIR, { recursive: true, mode: 0o700 } );
	fs.writeFileSync( statePath( account ), JSON.stringify( state ), { mode: 0o600 } );
}

function e2eSetupError( reason ) {
	return new UserActionRequired(
		`The E2E test accounts aren't set up on this machine: ${ reason }\n` +
			'Ask the user to run this in their own terminal, not through the agent, so the key stays out of the conversation. ' +
			'It asks for the key and says where to get it:\n' +
			`  ${ SETUP_COMMAND }\n` +
			`Or they can use their own login instead: ${ AUTH_COMMAND }`
	);
}

/**
 * Logs in an E2E test account using the credentials in the decrypted E2E secrets.
 */
async function logInTestAccount( account ) {
	// Logging in on calypso.localhost can't set the wordpress.com session cookie (it would
	// be a cross-site cookie), so log in on wordpress.com itself.
	process.env.CALYPSO_BASE_URL = 'https://wordpress.com';
	process.env.COOKIES_PATH = path.join( STATE_DIR, 'e2e-cookies' );
	fs.mkdirSync( process.env.COOKIES_PATH, { recursive: true, mode: 0o700 } );

	let TestAccount;
	try {
		( { TestAccount } = e2eRequire( '@automattic/calypso-e2e' ) );
	} catch ( error ) {
		throw e2eSetupError( `@automattic/calypso-e2e couldn't be loaded (${ error.message }).` );
	}

	let testAccount;
	try {
		testAccount = new TestAccount( account );
	} catch ( error ) {
		throw e2eSetupError( `the secrets couldn't be read (${ error.message }).` );
	}
	if ( ! testAccount.credentials ) {
		throw new UserActionRequired(
			`"${ account }" isn't an account in the E2E secrets. Try defaultUser, simpleSiteFreePlanUser or atomicUser.`
		);
	}

	const browser = await launchBrowser();
	try {
		const context = await browser.newContext();
		const page = await context.newPage();
		await testAccount.authenticate( page );
		await saveState( context, account );
	} finally {
		await browser.close();
	}
}

/**
 * Opens a visible browser window and waits for the user to log in to WordPress.com.
 */
async function logInOwnAccount( { timeoutMs = 10 * 60 * 1000 } = {} ) {
	const browser = await launchBrowser( {
		headless: false,
		args: [ '--disable-blink-features=AutomationControlled' ],
	} );
	try {
		const context = await browser.newContext( { viewport: null } );
		const page = await context.newPage();
		await page.goto( 'https://wordpress.com/log-in' );
		console.log( 'A browser window has opened. Log in to WordPress.com there.' );

		const deadline = Date.now() + timeoutMs;
		while ( Date.now() < deadline ) {
			const cookies = await context.cookies( 'https://wordpress.com' );
			if ( cookies.some( ( cookie ) => cookie.name.startsWith( 'wordpress_logged_in' ) ) ) {
				await saveState( context, OWN_ACCOUNT );
				return;
			}
			if ( ! browser.isConnected() || page.isClosed() ) {
				break;
			}
			await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );
		}
		throw new UserActionRequired( 'Login was not completed.' );
	} finally {
		if ( browser.isConnected() ) {
			await browser.close();
		}
	}
}

module.exports = {
	AUTH_COMMAND,
	OWN_ACCOUNT,
	PORT,
	UserActionRequired,
	isLoginUrl,
	launchBrowser,
	logInOwnAccount,
	logInTestAccount,
	statePath,
};

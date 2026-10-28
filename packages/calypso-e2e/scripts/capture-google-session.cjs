const { spawn, spawnSync } = require( 'node:child_process' );
const {
	existsSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
	renameSync,
	rmSync,
} = require( 'node:fs' );
const { tmpdir } = require( 'node:os' );
const { join } = require( 'node:path' );
const { createInterface } = require( 'node:readline/promises' );

const encryptedPath = join( __dirname, '../src/secrets/encrypted.enc' );
const temporaryPath = `${ encryptedPath }.${ process.pid }.tmp`;
const LOGIN_URL = 'https://wordpress.com/log-in';
const DEVICE_ACTIVITY_URL = 'https://myaccount.google.com/device-activity';
// Google refuses sign-in from Chrome for Testing (Playwright's bundled browser): use installed Chrome.
const DEFAULT_CHROME_PATHS = {
	darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	linux: 'google-chrome',
};
const chromePath = process.env.GOOGLE_CHROME_PATH || DEFAULT_CHROME_PATHS[ process.platform ];
const DEVTOOLS_PORT_FILE = 'DevToolsActivePort';
const BROWSER_START_TIMEOUT_MS = 15000;
const CDP_CONNECT_TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 250;
const SIGINT_EXIT_CODE = 130;
const BROWSER_EXIT_GRACE_MS = 5000;
// A real sign-in takes longer than this; a faster exit means a launcher, not Chrome itself.
const MIN_SIGN_IN_MS = 10000;
const PROFILE_REMOVE_RETRIES = 5;
const GOOGLE_DOMAINS = new Set( [
	'google.com',
	'accounts.google.com',
	'myaccount.google.com',
	'www.google.com',
] );

/** A failure whose message carries no secret values and can be printed as is. */
class CaptureError extends Error {}

let browserProcess;
let browserAlive = false;
let browserExited = Promise.resolve();
let launchError;
let profilePath;
let exiting = false;
let secretsWritten = false;
let signInStartedAt = 0;
const prompt = createInterface( { input: process.stdin, output: process.stdout } );

/**
 * Use the existing E2E secrets format without exposing OpenSSL output on failure.
 * @param {Buffer} input Ciphertext or plaintext.
 * @param {boolean} decrypt Whether to decrypt.
 * @returns {Buffer} Transformed bytes.
 */
function crypt( input, decrypt = false ) {
	const result = spawnSync(
		'openssl',
		[
			'enc',
			'-md',
			'sha1',
			'-aes-256-cbc',
			...( decrypt ? [ '-d' ] : [] ),
			'-pass',
			'env:E2E_SECRETS_KEY',
		],
		{ input, maxBuffer: 16 * 1024 * 1024, timeout: 15000 }
	);
	if ( result.error || result.status !== 0 ) {
		throw new CaptureError(
			decrypt ? 'Decryption failed; check E2E_SECRETS_KEY.' : 'Encryption failed.'
		);
	}
	return result.stdout;
}

/**
 * Starts installed Chrome as a plain process, not through Playwright: no automation flags.
 * DeviceBoundSessions (W3C DBSC) and EnableBoundSessionCredentials (Chrome's Google
 * account binding) are disabled so the session is not bound to this machine's key
 * store and survives the move to CI.
 * @param {string[]} args Extra arguments, e.g. the URL to open.
 */
function startChrome( args ) {
	// Cleanup stopping Chrome resumes code awaiting its exit: never start another browser then.
	if ( exiting ) {
		throw new CaptureError( 'Interrupted; secrets left unchanged.' );
	}
	// Keep the secrets key out of the browser's environment.
	const env = { ...process.env };
	delete env.E2E_SECRETS_KEY;
	launchError = undefined;
	browserProcess = spawn(
		chromePath,
		[
			`--user-data-dir=${ profilePath }`,
			'--disable-features=DeviceBoundSessions,EnableBoundSessionCredentials',
			'--no-first-run',
			'--no-default-browser-check',
			...args,
		],
		{ env, stdio: 'ignore' }
	);
	browserAlive = true;
	// A signal-killed process keeps exitCode null and a failed spawn never emits 'exit':
	// track liveness from the events instead.
	browserExited = new Promise( ( resolve ) => {
		browserProcess.once( 'exit', resolve );
		browserProcess.once( 'error', resolve );
	} ).then( () => {
		browserAlive = false;
	} );
	browserProcess.once( 'error', () => {
		launchError = new CaptureError(
			`Could not start Chrome at ${ chromePath }; install Google Chrome or set GOOGLE_CHROME_PATH.`
		);
	} );
}

/** Stops the running Chrome. Signal-based: only use it once the cookies have been read. */
async function stopChrome() {
	if ( ! browserAlive ) {
		return;
	}
	browserProcess.kill();
	// Escalate if the browser hangs: its profile must not outlive the script.
	const grace = setTimeout( () => browserProcess.kill( 'SIGKILL' ), BROWSER_EXIT_GRACE_MS );
	await browserExited;
	clearTimeout( grace );
}

/**
 * Opens the sign-in window. No DevTools port here: Google rejects sign-in from a Chrome
 * started with --remote-debugging-port ("This browser or app may not be secure").
 */
async function openSignInWindow() {
	if ( ! chromePath ) {
		throw new CaptureError( 'Unknown Chrome location on this platform; set GOOGLE_CHROME_PATH.' );
	}
	profilePath = mkdtempSync( join( tmpdir(), 'calypso-google-session-' ) );
	startChrome( [ LOGIN_URL ] );
	signInStartedAt = Date.now();

	// A missing binary fails asynchronously: surface it before asking for human effort.
	await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL_MS ) );
	if ( launchError ) {
		throw launchError;
	}
}

/**
 * Restarts the signed-in profile headless with a DevTools port. Same binary, so it can
 * decrypt the profile's cookies; no page loads, so Google never sees the port.
 * @returns {Promise<number>} The DevTools port the browser picked.
 */
async function reopenForCapture() {
	const portFile = join( profilePath, DEVTOOLS_PORT_FILE );
	rmSync( portFile, { force: true } );
	// Port 0: the browser picks a free loopback port and writes it to DevToolsActivePort.
	startChrome( [ '--headless', '--remote-debugging-port=0', 'about:blank' ] );

	const deadline = Date.now() + BROWSER_START_TIMEOUT_MS;
	while ( Date.now() < deadline ) {
		if ( launchError ) {
			throw launchError;
		}
		if ( ! browserAlive ) {
			throw new CaptureError( 'The browser exited before it was ready.' );
		}
		const port = existsSync( portFile )
			? Number( readFileSync( portFile, 'utf8' ).split( '\n' )[ 0 ] )
			: 0;
		if ( Number.isInteger( port ) && port > 0 ) {
			return port;
		}
		await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL_MS ) );
	}
	throw new CaptureError(
		`The browser did not report a DevTools port within ${ BROWSER_START_TIMEOUT_MS }ms; check chrome://policy for RemoteDebuggingAllowed set to false.`
	);
}

/** Closes the browser this script started and deletes its profile, which holds the live session. */
async function cleanup() {
	// The browser goes first: nothing below may prevent it from being stopped.
	await stopChrome();
	// Every step runs even if an earlier one throws: the profile must be attempted regardless.
	const steps = [
		() => rmSync( temporaryPath, { force: true } ),
		() =>
			profilePath &&
			rmSync( profilePath, { recursive: true, force: true, maxRetries: PROFILE_REMOVE_RETRIES } ),
		() => prompt.close(),
	];
	let failed = false;
	for ( const step of steps ) {
		try {
			step();
		} catch {
			failed = true;
		}
	}
	if ( failed ) {
		throw new CaptureError( 'Cleanup failed.' );
	}
}

/**
 * Reads the Google cookies from the restarted profile the human signed in with.
 * @param {number} port DevTools port.
 * @returns {Promise<Object[]>} Google-only cookies.
 */
async function readGoogleCookies( port ) {
	const { chromium } = require( 'playwright' );
	const browser = await chromium
		.connectOverCDP( `http://127.0.0.1:${ port }`, { timeout: CDP_CONNECT_TIMEOUT_MS } )
		.catch( () => {
			throw new CaptureError( 'Could not connect to the restarted browser.' );
		} );
	const contexts = browser.contexts();
	if ( contexts.length !== 1 ) {
		throw new CaptureError( `Expected 1 browser context, found ${ contexts.length }.` );
	}

	const all = await contexts[ 0 ].cookies();

	// Close the DevTools port as soon as the cookies are read: any local process could use it.
	// The deadline covers the CDP calls too: a hung browser must not stall the capture.
	const closeGracefully = browser
		.newBrowserCDPSession()
		.then( ( session ) => session.send( 'Browser.close' ) )
		.catch( () => {} )
		.then( () => browserExited );
	await Promise.race( [
		closeGracefully,
		new Promise( ( resolve ) => setTimeout( resolve, BROWSER_EXIT_GRACE_MS ) ),
	] );
	await stopChrome();

	const cookies = all.filter( ( cookie ) =>
		GOOGLE_DOMAINS.has( cookie.domain.replace( /^\./, '' ) )
	);
	if ( ! cookies.some( ( cookie ) => cookie.name === 'SID' ) ) {
		throw new CaptureError(
			'No Google SID cookie; finish signing in with Google, then quit Chrome normally (not force quit).'
		);
	}
	if (
		! cookies.some( ( cookie ) => [ '__Secure-1PSID', '__Secure-3PSID' ].includes( cookie.name ) )
	) {
		throw new CaptureError(
			'No Google __Secure-*PSID cookie; finish signing in with Google first.'
		);
	}
	return cookies;
}

/** Captures a human-established Google session into the encrypted E2E secrets. */
async function capture() {
	if (
		process.argv.length !== 2 ||
		! process.env.E2E_SECRETS_KEY ||
		process.env.DEBUG ||
		process.env.PWDEBUG
	) {
		throw new CaptureError(
			'Usage: node scripts/capture-google-session.cjs. Set E2E_SECRETS_KEY; unset DEBUG and PWDEBUG.'
		);
	}
	process.umask( 0o077 );

	// Fail on a wrong key before asking for any human effort.
	const original = readFileSync( encryptedPath );
	const secrets = JSON.parse( crypt( original, true ).toString() );
	if ( ! secrets.testAccounts?.googleLoginUser ) {
		throw new CaptureError( 'The secrets have no testAccounts.googleLoginUser entry.' );
	}

	await openSignInWindow();
	console.log(
		'In the browser window: choose "Continue with Google", sign in with the E2E Google account, complete any verification and reach My Home. Decline Chrome\'s own sign-in or sync prompt. Then quit Chrome (Cmd+Q on macOS, where closing the window is not enough). The capture continues when Chrome exits.'
	);
	// Only a graceful quit reliably flushes the cookie store: a signal can lose recent cookies.
	await browserExited;
	if ( launchError ) {
		throw launchError;
	}
	if ( Date.now() - signInStartedAt < MIN_SIGN_IN_MS ) {
		throw new CaptureError(
			'Chrome exited immediately; GOOGLE_CHROME_PATH must point to the Chrome binary itself, not a launcher.'
		);
	}
	// A crash or force quit may not have written the cookies: don't capture a partial session.
	if ( browserProcess.exitCode !== 0 ) {
		throw new CaptureError( 'Chrome did not quit normally (crash or force quit); start over.' );
	}
	const port = await reopenForCapture();
	const cookies = await readGoogleCookies( port );
	// An interrupt during the CDP read must not be followed by the synchronous write below.
	if ( exiting ) {
		throw new CaptureError( 'Interrupted; secrets left unchanged.' );
	}

	secrets.testAccounts.googleLoginUser.googleSessionCookies = cookies;
	const plaintext = Buffer.from( JSON.stringify( secrets, null, 2 ) + '\n' );
	const ciphertext = crypt( plaintext );
	if ( ! crypt( ciphertext, true ).equals( plaintext ) ) {
		throw new CaptureError( 'The re-encrypted secrets did not decrypt to the same content.' );
	}
	writeFileSync( temporaryPath, ciphertext, { mode: 0o600, flag: 'wx' } );
	if ( ! readFileSync( encryptedPath ).equals( original ) ) {
		throw new CaptureError( 'encrypted.enc changed during the capture; start over.' );
	}
	renameSync( temporaryPath, encryptedPath );
	secretsWritten = true;

	console.log( `Encrypted ${ cookies.length } Google cookies.` );
	await prompt.question(
		'Validate the restored session in another terminal (see test/e2e/docs/google_authentication.md). If it passes, press Enter: Chrome reopens on Google device activity to revoke older sessions. If it fails, press Ctrl+C and restore encrypted.enc with git.\n'
	);

	// Revoke from the captured session itself, so "Your current session" is the one we keep.
	startChrome( [ DEVICE_ACTIVITY_URL ] );
	console.log(
		'Sign out every session except "Your current session", then quit Chrome (Cmd+Q on macOS). The profile is deleted when Chrome exits.'
	);
	await browserExited;

	// The ciphertext is already written: a failure here only means revocation is unconfirmed.
	if ( launchError || browserProcess.exitCode !== 0 ) {
		throw new CaptureError(
			`encrypted.enc was updated, but the revocation window failed; sign out older sessions at ${ DEVICE_ACTIVITY_URL } from another browser.`
		);
	}
}

/**
 * Single exit path: every outcome closes the browser and deletes its profile first.
 * @param {number} code Process exit code.
 * @param {string} [message] Secret-free message for stderr.
 */
async function finish( code, message ) {
	if ( exiting ) {
		return;
	}
	exiting = true;
	const cleaned = await cleanup().then(
		() => true,
		() => false
	);
	if ( message ) {
		console.error( message );
	}
	if ( ! cleaned ) {
		const leftovers = [ profilePath, temporaryPath ].filter(
			( path ) => path && existsSync( path )
		);
		const warning = leftovers.includes( profilePath )
			? ' The profile holds a live Google session.'
			: '';
		// A cleanup failure after a successful write must not read as a failed capture: re-running creates another live session.
		const written = secretsWritten ? ' encrypted.enc was updated; do not capture again.' : '';
		console.error(
			`Cleanup failed:${ written } Stop any leftover browser and delete ${
				leftovers.join( ', ' ) || 'nothing (all files were removed)'
			}.${ warning }`
		);
		code = code || 1;
	}
	// The CDP connection keeps the event loop alive.
	process.exit( code );
}

const interrupted = () =>
	finish(
		SIGINT_EXIT_CODE,
		secretsWritten
			? 'Google session capture interrupted after encrypted.enc was updated.'
			: 'Google session capture interrupted; secrets left unchanged.'
	);

// `on`, not `once`: a repeated signal during cleanup must not fall back to Node's default exit.
// readline turns a terminal Ctrl+C into its own event; signals from elsewhere reach the process.
prompt.on( 'SIGINT', interrupted );
process.on( 'SIGINT', interrupted );
process.on( 'SIGTERM', interrupted );
process.on( 'SIGHUP', interrupted );
// A pending question never settles once stdin ends (e.g. a non-interactive run): stop instead of hanging.
prompt.once( 'close', () =>
	finish(
		1,
		secretsWritten
			? 'Google session capture stopped: input closed after encrypted.enc was updated.'
			: 'Google session capture failed: input closed before confirmation; secrets left unchanged.'
	)
);

capture()
	.then( () => finish( 0, 'Google session captured; encrypted.enc updated.' ) )
	.catch( ( error ) => {
		const reason =
			error instanceof CaptureError ? error.message : `Unexpected ${ error?.name ?? 'error' }.`;
		return finish( 1, `Google session capture failed: ${ reason } No secret values were logged.` );
	} );

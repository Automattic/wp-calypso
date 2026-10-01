const { spawnSync } = require( 'node:child_process' );
const { readFileSync, writeFileSync, renameSync, rmSync } = require( 'node:fs' );
const { join } = require( 'node:path' );

const port = Number( process.argv[ 2 ] );
const encryptedPath = join( __dirname, '../src/secrets/encrypted.enc' );
const temporaryPath = `${ encryptedPath }.${ process.pid }.tmp`;
let stage = 'configuration';

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
		throw new Error();
	}
	return result.stdout;
}

/** Capture from the original human-authenticated context without closing Chrome. */
async function capture() {
	if (
		process.argv.length !== 3 ||
		! Number.isInteger( port ) ||
		port < 1024 ||
		port > 65535 ||
		! process.env.E2E_SECRETS_KEY ||
		process.env.DEBUG ||
		process.env.PWDEBUG
	) {
		console.error(
			'Usage: node scripts/capture-google-session.cjs <loopback CDP port>. Set E2E_SECRETS_KEY; unset DEBUG and PWDEBUG.'
		);
		process.exit( 1 );
	}
	process.umask( 0o077 );
	stage = 'decrypting existing E2E secrets';
	const original = readFileSync( encryptedPath );
	const secrets = JSON.parse( crypt( original, true ).toString() );
	if ( ! secrets.testAccounts?.googleLoginUser ) {
		throw new Error();
	}

	stage = 'connecting to the dedicated Chrome window';
	const { chromium } = require( 'playwright' );
	const browser = await chromium.connectOverCDP( `http://127.0.0.1:${ port }`, {
		timeout: 15000,
	} );
	if ( browser.contexts().length !== 1 ) {
		throw new Error();
	}
	stage = 'capturing the Google session';
	const domains = new Set( [
		'google.com',
		'accounts.google.com',
		'myaccount.google.com',
		'www.google.com',
	] );
	const cookies = ( await browser.contexts()[ 0 ].cookies() ).filter( ( cookie ) =>
		domains.has( cookie.domain.replace( /^\./, '' ) )
	);
	if (
		! cookies.some( ( cookie ) => cookie.name === 'SID' ) ||
		! cookies.some( ( cookie ) => [ '__Secure-1PSID', '__Secure-3PSID' ].includes( cookie.name ) )
	) {
		throw new Error();
	}

	stage = 'encrypting and verifying the replacement';
	secrets.testAccounts.googleLoginUser.googleSessionCookies = cookies;
	const plaintext = Buffer.from( JSON.stringify( secrets, null, 2 ) + '\n' );
	const ciphertext = crypt( plaintext );
	if ( ! crypt( ciphertext, true ).equals( plaintext ) ) {
		throw new Error();
	}
	stage = 'saving the encrypted session';
	writeFileSync( temporaryPath, ciphertext, { mode: 0o600, flag: 'wx' } );
	if ( ! readFileSync( encryptedPath ).equals( original ) ) {
		throw new Error();
	}
	renameSync( temporaryPath, encryptedPath );
	console.log(
		`Encrypted ${ cookies.length } Google cookies. Run the Google authentication test before closing the source Chrome window.`
	);
	// Disconnect this client without closing the human's browser.
	process.exit( 0 );
}

capture().catch( () => {
	rmSync( temporaryPath, { force: true } );
	console.error( `Google session capture failed while ${ stage }. No secret values were logged.` );
	process.exit( 1 );
} );

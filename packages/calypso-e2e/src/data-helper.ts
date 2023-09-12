import { webcrypto } from 'node:crypto';
import phrase from 'asana-phrase';
import envVariables from './env-variables';
import { SecretsManager } from './secrets';
import type { Secrets, TestAccountName } from './secrets';
import type {
	PaymentDetails,
	DateFormat,
	RegistrarDetails,
	NewTestUserDetails,
	AccountCredentials,
} from './types/data-helper.types';

/**
 * Returns a set of data required to sign up
 * as a new user and create a new site.
 *
 * Note that this function only generates the test data;
 * it does not actually create the test user.
 *
 * @param param0 Object parameter.
 * @param {keyof Secrets['mailosaur']} [param0.mailosaurInbox] Optional key to specify the mailosaur server to use. Defaults to `signupInboxId`.
 * @param {string} [param0.usernamePrefix] Optional key to specify the username prefix inserted between the `e2eflowtesting` and timestamp. Defaults to an empty string.
 * @returns Data for new test user.
 */
export function getNewTestUser( {
	mailosaurInbox = 'signupInboxId',
	usernamePrefix = '',
}: {
	mailosaurInbox?: keyof Secrets[ 'mailosaur' ];
	usernamePrefix?: string;
} = {} ): NewTestUserDetails {
	const username = getUsername( { prefix: usernamePrefix } );
	const password = generateRandomPassword();

	const email = getTestEmailAddress( {
		inboxId: SecretsManager.secrets.mailosaur[ mailosaurInbox ],
		prefix: username,
	} );
	const siteName = getBlogName();

	return {
		username: username,
		password: password,
		email: email,
		siteName: siteName,
		inboxId: SecretsManager.secrets.mailosaur[ mailosaurInbox ],
	};
}

/**
 * Generate a pseudo-random integer, inclusive on the lower bound and exclusive on the upper bound.
 *
 * @param {number} min Minimum value, inclusive.
 * @param {number} max Maximum value, exclusive.
 * @returns {number} Generated pseudo-random integer.
 */
export function getRandomInteger( min: number, max: number ): number {
	min = Math.ceil( min );
	max = Math.floor( max );
	return Math.floor( Math.random() * ( max - min ) + min );
}

/**
 * Returns the current date as a time stamp.
 *
 * @returns {string} Date represented as a timestamp.
 */
export function getTimestamp(): string {
	return new Date().getTime().toString();
}

/**
 * Returns a username.
 *
 * If optional parameter `prefix` is set, the value
 * is inserted between the `e2eflowtesting` prefix
 * and the timestamp.
 *
 * Example:
 * 	e2eflowtesting-1654124900-728
 * 	e2eflowtestingfree-1654124900-129
 *
 * @param param0 Object parameter.
 * @param {string} param0.prefix Prefix for the username.
 * @returns {string} Generated username.
 */
export function getUsername( { prefix = '' }: { prefix?: string } = {} ): string {
	const timestamp = getTimestamp();
	const randomNumber = getRandomInteger( 0, 999 );
	return `e2eflowtesting${ prefix }${ timestamp }${ randomNumber }`;
}

/**
 * Returns the date string in the requested format.
 *
 * @param {DateFormat} format Date format supported by NodeJS.
 * @returns {string|null} If valid date format string is supplied, string is returned. Otherwise, null.
 */
export function getDateString( format: DateFormat ): string | null {
	if ( format === 'ISO-8601' ) {
		return new Date().toISOString();
	}
	return null;
}

/**
 * Generates a new name for test blog with prefix `e2eflowtesting`.
 *
 * Examples:
 * 	e2eflowtesting16900000102
 * 	e2eflowtesting14928337999
 *
 * @returns {string} Generated blog name.
 */
export function getBlogName(): string {
	return `e2eflowtesting${ getTimestamp() }${ getRandomInteger( 100, 999 ) }`;
}

/**
 * Assembles and returns the URL to a specific route/asset/query in Calypso.
 *
 * @param {string} route Additional state or page to build into the returned URL.
 * @param {Object} queryStrings Key/value pair of additional query to build into into the returned URL.
 * @returns {string} String representation of the constructed URL object.
 */
export function getCalypsoURL(
	route = '',
	queryStrings: { [ key: string ]: string } = {}
): string {
	const base = envVariables.CALYPSO_BASE_URL;

	const url = new URL( route, base );

	Object.entries( queryStrings ).forEach( ( [ key, value ] ) =>
		url.searchParams.append( key, value )
	);

	return url.toString();
}

/**
 * Returns the credential for a specified account from the secrets file.
 *
 * @param {TestAccountName} accountType Type of the account for which the credentials are to be obtained.
 * @returns {AccountCredentials} Username and password found in the secrets file for the given account type.
 * @throws {Error} If accountType does not correspond to a valid entry in the file.
 */
export function getAccountCredential( accountType: TestAccountName ): AccountCredentials {
	const testAccount = SecretsManager.secrets.testAccounts[ accountType ];
	if ( ! testAccount ) {
		throw new Error(
			`Secrets file did not contain credentials for requested user ${ accountType }. Update typings or the secrets file.`
		);
	}
	return {
		username: testAccount.username,
		password: testAccount.password,
		totpKey: testAccount.totpKey,
	};
}

/**
 * Returns the site URL for a specified account from the secrets file.
 *
 * @param {TestAccountName} accountType Type of the account for which the site URL is to be obtained.
 * @param {{key: string}: boolean} param1 Keyed object parameter.
 * @param {boolean} param1.protocol Whether to include the protocol in the returned URL. Defaults to true.
 * @returns {string} Site URL for the given username.
 * @throws {Error} If the accountType does not have a site URL defined, or accountType does not have an entry in the file.
 * @throws {ReferenceError} If URL is not defined for the accountType.
 */
export function getAccountSiteURL(
	accountType: TestAccountName,
	{ protocol = true }: { protocol?: boolean } = {}
): string {
	const testAccount = SecretsManager.secrets.testAccounts[ accountType ];
	const url = testAccount.primarySite || testAccount.testSites?.primary.url;
	if ( ! testAccount ) {
		throw new Error(
			`Secrets file did not contain credentials for requested user ${ accountType }. Update typings or the secrets file.`
		);
	}

	if ( ! url ) {
		throw new ReferenceError(
			`Secrets entry for ${ accountType } has no primary site URL defined.`
		);
	}

	if ( protocol ) {
		return new URL( `https://${ url }` ).toString();
	}

	return url.toString();
}

/**
 * Returns the bearer token of the user allowed to make media uploads to the ToS media upload destination wpcomtos.wordpress.com.
 *
 * @returns {string} Bearer token for the user allowed to make uploads.
 */
export function getTosUploadToken(): string {
	return SecretsManager.secrets.martechTosUploadCredentials.bearer_token;
}

/**
 * Returns the site upload destination for the ToS screenshots.
 *
 * @returns {string} Site ID of the destination to which uploaded.
 */
export function getTosUploadDestination(): string {
	return '200900774'; // wpcom site ID
}

/**
 * Returns a new test email address with the domain name `mailosaur.io` within a specific inbox.
 *
 * Examples:
 * 	e2eflowtestingpaid1600000@inboxID.mailosaur.net
 *
 * @deprecated Use EmailClient.getTestEmailAddress instead.
 * @param param0 Keyed parameter object.
 * @param {string} param0.inboxId Existing inbox ID on mailosaur.
 * @param {string} param0.prefix Custom prefix to be prepended to the inboxId but after the global email prefix.
 * @returns {string} Unique test email.
 */
export function getTestEmailAddress( {
	inboxId,
	prefix = '',
}: {
	inboxId: string;
	prefix: string;
} ): string {
	const domain = 'mailosaur.net';
	return `${ prefix }@${ inboxId }.${ domain }`;
}

/**
 * Returns an object containing test credit card payment information.
 *
 * Simulated credit card information is supplied by Stripe. For more information, see https://stripe.com/docs/testing#cards.
 *
 * @returns {PaymentDetails} Object that implements the PaymentDetails interface.
 */
export function getTestPaymentDetails(): PaymentDetails {
	// Only Visa is implemented for now.
	return {
		cardHolder: 'End to End Testing',
		cardNumber: '4242 4242 4242 4242',
		expiryMonth: '02',
		expiryYear: '28',
		cvv: '999',
		countryCode: 'TR', // Set to Turkey to force Strip to process payments.
		postalCode: '06123',
	};
}

/**
 * Returns an object containing test domain registrar details.
 *
 * @param {string} email Email address of the user.
 */
export function getTestDomainRegistrarDetails( email: string ): RegistrarDetails {
	return {
		firstName: 'End to End',
		lastName: 'Testing',
		email: email,
		phone: '0422 888 888',
		countryCode: 'AU',
		address: '888 Queen Street',
		city: 'Brisbane',
		stateCode: 'QLD',
		postalCode: '4000',
	};
}

/**
 * Returns the hostname for Jetpack.
 *
 * @returns {string} Hostname to be used. Returns value of JETPACKHOST environment variable if set; WPCOM otherwise.
 */
export function getJetpackHost(): string {
	return process.env.JETPACKHOST || 'WPCOM';
}

/**
 * Given either a string or array of strings, returns a single string with each word in TitleCase.
 *
 * @param {string[]|string} words Either string or array of strings to be converted to TitleCase.
 * @returns {string} String with each distinct word converted to TitleCase.
 */
export function toTitleCase( words: string[] | string ): string {
	if ( typeof words === 'string' ) {
		words = words.trim().split( ' ' );
	}

	const result = words.map( function ( word ) {
		return word.charAt( 0 ).toUpperCase() + word.slice( 1 );
	} );

	return result.join( ' ' );
}

/**
 * Generates a random phrase in proper case (Sample Sentence Text).
 *
 * @returns {string} Generated text.
 */
export function getRandomPhrase(): string {
	const generated: Array< string > = phrase.default32BitFactory().randomPhrase();
	return toTitleCase( generated );
}

/**
 * Generates a structured test suite name from environmental and user-provided parameters.
 *
 * @param {string} title Title of the test.
 * @returns {string} Test suite name.
 */
export function createSuiteTitle( title: string ): string {
	const parts = [ `${ toTitleCase( title ) }` ];

	if ( envVariables.RUN_ID ) {
		parts.push( `(${ envVariables.RUN_ID })` );
	}

	return parts.join( ' ' );
}

/**
 * Returns the Magnificent 16 test locales, known as Mag16.
 *
 * @returns {string[]} Array of strings in ISO-639-1 standard.
 */
export function getMag16Locales(): string[] {
	return [
		'en',
		'es',
		'pt-br',
		'de',
		'fr',
		'he',
		'ja',
		'it',
		'nl',
		'ru',
		'tr',
		'id',
		'zh-cn',
		'zh-tw',
		'ko',
		'ar',
		'sv',
	];
}

/**
 * Returns the list of viewports that are available for the framework.
 *
 * @returns {string([])} Array of strings for valid viewports.
 */
export function getViewports(): string[] {
	return [ 'mobile', 'desktop' ];
}

interface PasswordOptions {
	length?: number;
	characterAllowList?: string;
}
/**
 * Generates a random password with enough cryptographic security for our testing purposes here.
 *
 * By default, it is 24 characters long and uses lowercase, uppercase, and numbers.
 *
 * @param {PasswordOptions} options Options to control password generation.
 */
export function generateRandomPassword( options?: PasswordOptions ) {
	const length = options?.length || 24;
	const characterAllowList =
		options?.characterAllowList || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

	const secureRandomNumbers = webcrypto.getRandomValues( new Uint8Array( length ) );

	const password: string[] = [];

	for ( const randomNumber of secureRandomNumbers ) {
		password.push( characterAllowList[ randomNumber % characterAllowList.length ] );
	}

	return password.join( '' );
}

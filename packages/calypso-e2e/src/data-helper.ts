import phrase from 'asana-phrase';
import config from 'config';

export type DateFormat = 'ISO';
export { config };

export interface PaymentDetails {
	cardHolder: string;
	cardNumber: string;
	expiryMonth: string;
	expiryYear: string;
	cvv: string;
	countryCode: string;
	postalCode: string;
}

export interface RegistrarDetails {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	countryCode: string;
	address: string;
	city: string;
	stateCode: string;
	postalCode: string;
}

export type CreditCardIssuers = 'Visa';

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
 * Returns the date string in the requested format.
 *
 * @param {DateFormat} format Date format supported by NodeJS.
 * @returns {string|null} If valid date format string is supplied, string is returned. Otherwise, null.
 */
export function getDateString( format: DateFormat ): string | null {
	if ( format === 'ISO' ) {
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
	const base: string = config.get( 'calypsoBaseURL' );

	const url = new URL( route, base );

	Object.entries( queryStrings ).forEach( ( [ key, value ] ) =>
		url.searchParams.append( key, value )
	);

	return url.toString();
}

/**
 * Returns the credential for a specified account from the secrets file.
 *
 * @param {string} accountType Type of the account for which the credentials are to be obtained.
 * @returns {string[]} Username and password found in the secrets file for the given account type.
 * @throws {Error} If accountType does not correspond to a valid entry in the file.
 */
export function getAccountCredential( accountType: string ): [ string, string ] {
	const testAccounts: { [ key: string ]: string } = config.get( 'testAccounts' );
	if ( ! Object.keys( testAccounts ).includes( accountType ) ) {
		throw new Error(
			`Secrets file did not contain credentials for requested user ${ accountType }.`
		);
	}

	const [ username, password ] = testAccounts[ accountType ];
	return [ username, password ];
}

/**
 * Returns the site URL for a specified account from the secrets file.
 *
 * @param {string} accountType Type of the account for which the site URL is to be obtained.
 * @param {{key: string}: boolean} param1 Keyed object parameter.
 * @param {boolean} param1.protocol Whether to include the protocol in the returned URL. Defaults to true.
 * @returns {string} Site URL for the given username.
 * @throws {Error} If the accountType does not have a site URL defined, or accountType does not have an entry in the file.
 * @throws {ReferenceError} If URL is not defined for the accountType.
 */
export function getAccountSiteURL(
	accountType: string,
	{ protocol = true }: { protocol?: boolean } = {}
): string {
	const testAccounts: { [ key: string ]: string } = config.get( 'testAccounts' );
	if ( ! Object.keys( testAccounts ).includes( accountType ) ) {
		throw new Error( `Secrets file did not contain URL for requested user ${ accountType }.` );
	}

	const [ , , url ] = testAccounts[ accountType ];
	if ( ! url ) {
		throw new ReferenceError( `Secrets entry for ${ accountType } has no site URL defined.` );
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
 * @throws {Error} If the bearer token is missing in the config file.
 */
export function getTosUploadToken(): string {
	const uploadCredentials: { [ key: string ]: string } = config.get(
		'martechTosUploadCredentials'
	);
	if ( ! Object.keys( uploadCredentials ).includes( 'bearer_token' ) ) {
		throw new Error(
			'Secrets file did not contain the bearer token for the ToS media destination'
		);
	}
	const bearerToken = uploadCredentials[ 'bearer_token' ];
	return bearerToken;
}

/**
 * Returns a new test email address with the domain name `mailosaur.io` within a specific inbox.
 *
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
	const domain = 'mailosaur.io';
	return `${ prefix }.${ inboxId }@${ domain }`;
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
 * Adjusts the user invite link to the correct environment.
 *
 * By default, all invite links reference the production `wordpress.com` hostname.
 * However, for end-to-end tests it is desirable to test invite functionality against
 * the development environment.
 *
 * @param {string} inviteURL Full invitation link.
 * @returns {string} Adjusted invitation link with the intended hostname.
 */
export function adjustInviteLink( inviteURL: string ): string {
	const originalURL = new URL( inviteURL );
	const adjustedURL = new URL( originalURL.pathname, config.get( 'calypsoBaseURL' ) );
	return adjustedURL.href;
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

	return parts.join( ' ' );
}

/**
 * Parses a WPCOM site host name (without the scheme) from a given site-specific page URL.
 * For example:
 *  - testsite.wordpress.com/wp-admin/post --> testsite.wordpress.com
 *  - wordpress.com/post/testsite.blog --> testsite.blog
 *
 * @param {string} url URL of a site-specific page.
 * @returns Host name without scheme (e.g. 'testsite.wordpress.com').
 * @throws If no host name can be parsed.
 */
export function parseSiteHostFromUrl( url: string ): string {
	if ( url.includes( '/wp-admin' ) ) {
		return new URL( url ).host;
	}

	const pathSuffix = new URL( url ).pathname.split( '/' ).pop();
	const hostRegex = /([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+/;
	if ( pathSuffix?.match( hostRegex ) ) {
		return pathSuffix;
	}

	throw new Error(
		`Could not parse WPCOM site host from url (${ url }). Are you sure you're on a site-specific page?`
	);
}

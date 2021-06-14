/**
 * External dependencies
 */
import phrase from 'asana-phrase';
import config from 'config';

/**
 * Internal dependencies
 */
import { getViewportName } from './browser-helper';

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
 * Returns the credential for a specified account from the configuration file.
 *
 * @param {string} username Username of the account for which the password is to be obtained.
 * @returns {string} Credential entry found in the configuration file for the given username.
 * @throws {Error} If username does not correspond to a valid entry in the configuration file.
 */
export function getAccountCredential( username: string ): string {
	const testAccounts: { [ key: string ]: string } = config.get( 'testAccounts' );
	try {
		return testAccounts[ username ];
	} catch ( err ) {
		throw new Error( `Credential for username: ${ username } not found in configuration file.` );
	}
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
		return word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase();
	} );

	return result.join( ' ' );
}

/**
 * Generates a random phrase in proper case (Sample Sentence Text).
 *
 * @returns {string} Generated text.
 */
export function randomPhrase(): string {
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
	const parts = [
		`[${ getJetpackHost() }]`,
		`${ toTitleCase( title ) }:`,
		`(${ getViewportName() })`,
		'@parallel',
	];

	return parts.join( ' ' );
}

/**
 * Returns a test email address resolving to a real Mailosaur address.
 *
 * @param {[key: string]: string} options Object to control the generated email address.
 * @param {string} options.prefix String prefix to be prepended prior to the global email prefix.
 * @param {string} options.inboxId String identifier of the Mailosaur inbox.
 * @returns {string} Email address.
 */
export function getTestEmailAddress( options: { prefix: string; inboxId: string } ): string {
	const domain = 'mailosaur.io';
	const globalEmailPrefix = config.has( 'emailPrefix' ) ? config.get( 'emailPrefix' ) : '';
	return `${ globalEmailPrefix }${ options.prefix }.${ options.inboxId }@${ domain }`;
}

/**
 * Generate and return a test domain registrar contact information.
 *
 * @param {[key: string]: string} options Object to control the generated registrar details.options.
 * @param {string} options.email Email address to be used for the test domain registrar details.
 * @returns {[key: string]: string} Object containing generated domain registrar details.
 */
export function getTestDomainRegistrarDetails( options: {
	email: string;
} ): { [ key: string ]: string } {
	return {
		firstName: 'End to End',
		lastName: 'Testing',
		emailAddress: options.email,
		phoneNumber: '0422 888 888',
		countryCode: 'AU',
		address: '888 Queen Street',
		city: 'Brisbane',
		stateCode: 'QLD',
		postalCode: '4000',
	};
}

/**
 * Generate and return a test blog name.
 *
 * @returns {string} Test blog name.
 */
export function getNewBlogName(): string {
	return `e2eflowtesting${ new Date().getTime().toString() }${ getRandomInt( 100, 999 ) }`;
}

/**
 * Returns a pseudo-random integer between the min and max values.
 *
 * @param {number} min Minimum value of the bound.
 * @param {number} max Maximum value of the bound.
 * @returns {number} Generated pseudo-random number.
 */
export function getRandomInt( min: number, max: number ): number {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

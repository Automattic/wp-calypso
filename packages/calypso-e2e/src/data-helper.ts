import phrase from 'asana-phrase';
import config from 'config';
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
 * Returns the credential for a specified account from the secrets file.
 *
 * @param {string} accountType Type of the account for which the credentials are to be obtained.
 * @returns {string[]} Username and password found in the secrets file for the given account type.
 * @throws {Error} If accountType does not correspond to a valid entry in the file.
 */
export function getAccountCredential( accountType: string ): string[] {
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
 * @returns {string} Site URL for the given username.
 * @throws {Error} If the accountType does not have a site URL defined, or accountType does not have an entry in the file.
 * @throws {ReferenceError} If URL is not defined for the accountType.
 */
export function getAccountSiteURL( accountType: string ): string {
	const testAccounts: { [ key: string ]: string } = config.get( 'testAccounts' );
	if ( ! Object.keys( testAccounts ).includes( accountType ) ) {
		throw new Error( `Secrets file did not contain URL for requested user ${ accountType }.` );
	}

	const [ , , url ] = testAccounts[ accountType ];
	if ( ! url ) {
		throw new ReferenceError( `Secrets entry for ${ accountType } has no site URL defined.` );
	}

	return new URL( `https://${ url }` ).toString();
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

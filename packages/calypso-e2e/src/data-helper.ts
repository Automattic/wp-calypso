/**
 * External dependencies
 */
import phrase from 'asana-phrase';
import config from 'config';

/**
 *
 */
declare global {
	interface String {
		toProperCase(): string;
	}
}

String.prototype.toProperCase = function (): string {
	return this.replace( /\w\S*/g, function ( txt ) {
		return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
	} );
};

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
 * Generates a random phrase in proper case (Sample Sentence Text).
 *
 * @returns {string} Generated text.
 */
export function randomPhrase(): string {
	const gen: Array< string > = phrase.default32BitFactory().randomPhrase();
	return `${ gen[ 1 ].toProperCase() } ${ gen[ 2 ].toProperCase() } ${ gen[ 3 ].toProperCase() } ${ gen[ 4 ].toProperCase() }`;
}

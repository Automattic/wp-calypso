/**
 * External dependencies
 */
import phrase from 'asana-phrase';
import config from 'config';
import { difference, map } from 'lodash';
import fs from 'fs';

String.prototype.toProperCase = function () {
	return this.replace( /\w\S*/g, function ( txt ) {
		return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
	} );
};

export function randomPhrase() {
	const gen = phrase.default32BitFactory().randomPhrase();
	return `${ gen[ 1 ].toProperCase() } ${ gen[ 2 ].toProperCase() } ${ gen[ 3 ].toProperCase() } ${ gen[ 4 ].toProperCase() }`;
}

export function getEmailAddress( prefix, inboxId ) {
	const domain = 'mailosaur.io';
	const globalEmailPrefix = config.has( 'emailPrefix' ) ? config.get( 'emailPrefix' ) : '';
	return `${ globalEmailPrefix }${ prefix }.${ inboxId }@${ domain }`;
}

export function getExpectedFreeAddresses( searchTerm ) {
	const suffixes = [ '.wordpress.com', 'blog.wordpress.com', 'site.wordpress.com', '.home.blog' ];
	return map( suffixes, ( suffix ) => {
		return searchTerm + suffix;
	} );
}

export function getNewBlogName() {
	return `e2eflowtesting${ new Date().getTime().toString() }${ getRandomInt( 100, 999 ) }`;
}

export function getMenuName() {
	return `menu${ new Date().getTime().toString() }`;
}

export function getWidgetTitle() {
	return `WIDGET ${ new Date().getTime().toString() }`;
}

export function getWidgetContent() {
	return this.randomPhrase();
}

function getRandomInt( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

// Use `global.__TEMPJETPACKHOST__` for local host overrides. Useful in cases when running flows on different host
// For example: creating new account when running Jetpack tests
export function getJetpackHost() {
	return global.__TEMPJETPACKHOST__ || process.env.JETPACKHOST || 'WPCOM';
}

export function getTestCouponCode() {
	if ( config.has( 'testCouponCode' ) ) {
		return config.get( 'testCouponCode' );
	}
	throw new Error( 'Looks like the testCouponCode is missing from your config' );
}

export function getTargetType() {
	return process.env.TARGET || null;
}

export function isRunningOnLiveBranch() {
	return config.has( 'liveBranch' ) && config.get( 'liveBranch' );
}

export function isRunningOnJetpackBranch() {
	return config.has( 'jetpackBranch' ) && config.get( 'jetpackBranch' );
}

export function adjustInviteLinkToCorrectEnvironment( acceptInviteURL ) {
	const calypsoBaseUrl = this.configGet( 'calypsoBaseURL' );
	acceptInviteURL = acceptInviteURL.replace( 'https://wordpress.com', calypsoBaseUrl );
	return acceptInviteURL;
}

/**
 * Gets the account configs from the local config file.
 *
 * If the local configuration doesn't exist, fall back to the environmental variable.
 *
 * @param {string} account The account entry to get
 * @returns {object} account Username/Password pair
 */
export function getAccountConfig( account ) {
	const host = this.getJetpackHost();
	const target = this.getTargetType();
	const globalConfig = config.get( 'testAccounts' );
	let localConfig;

	if ( target && config.has( target ) ) {
		const targetConfig = config.get( target );
		if ( targetConfig.has( 'testAccounts' ) ) {
			localConfig = targetConfig.get( 'testAccounts' );

			if ( host !== 'WPCOM' && ! localConfig.has( account ) && ! globalConfig.has( account ) ) {
				account = 'jetpackUser' + host;
			}
			if ( localConfig.has( account ) ) {
				return localConfig[ account ];
			}
		}
	}

	if ( config.has( 'testAccounts' ) ) {
		localConfig = config.get( 'testAccounts' );
	}

	if ( host !== 'WPCOM' && ! localConfig.has( account ) ) {
		account = 'jetpackUser' + host;
	}

	return localConfig[ account ];
}

/**
 * Wrapper around `config.get` to search in TARGET section first
 *
 * @param {string} key The config key to get
 * @returns {object} value from config file
 */
export function configGet( key ) {
	const target = this.getTargetType();

	if ( target && config.has( target ) ) {
		const targetConfig = config.get( target );
		if ( targetConfig.has( key ) ) {
			return targetConfig.get( key );
		}
	}

	return config.get( key );
}

export function getAllAccountsWithFeatures( features = [] ) {
	if ( typeof features === 'string' && features.split( ' ' ).length > 1 ) {
		features = features.split( ' ' );
	}

	if ( ! Array.isArray( features ) ) {
		features = [ features ];
	}

	let allAccounts = [];

	if ( config.has( 'accounts' ) ) {
		allAccounts = config.get( 'accounts' );
	}

	const mustHaveFeatures = [],
		mustNotHaveFeatures = [];
	features.forEach( function ( feature ) {
		if ( feature.indexOf( '-' ) === 0 ) {
			mustNotHaveFeatures.push( feature.substring( 1 ) );
		} else if ( feature.indexOf( '+' ) === 0 ) {
			mustHaveFeatures.push( feature.substring( 1 ) );
		} else {
			mustHaveFeatures.push( feature );
		}
	} );

	return allAccounts.filter( function ( account ) {
		// return accounts that have all the "must-have" features and none of the "must-not-have" ones.
		return (
			difference( mustHaveFeatures, account.features || [] ).length === 0 &&
			difference( mustNotHaveFeatures, account.features || [] ).length ===
				mustNotHaveFeatures.length
		);
	} );
}

export function hasAccountWithFeatures( features ) {
	return getAllAccountsWithFeatures( features ).length > 0;
}

export function pickRandomAccountWithFeatures( features ) {
	const accounts = getAllAccountsWithFeatures( features ).filter( function ( account ) {
		return ! account.inUse;
	} );

	if ( accounts.length === 0 ) {
		return null;
	}

	const account = accounts[ Math.floor( Math.random() * accounts.length ) ];
	account.inUse = true;

	return account;
}

export function releaseAccount( account ) {
	delete account.inUse;
}

export function getJetpackSiteName() {
	const host = this.getJetpackHost();

	if ( host === 'WPCOM' ) {
		return null;
	}

	if ( host === 'CI' ) {
		return `${ process.env.CIRCLE_SHA1.substr( 0, 20 ) }.wp-e2e-tests.pw`;
	}

	if ( host === 'JN' ) {
		// get site url from file content
		let contents = fs.readFileSync( './temp/jn-credentials.txt' );
		if ( contents instanceof Buffer ) {
			contents = contents.toString();
		}
		return contents
			.split( ' ' )[ 0 ]
			.replace( /^https?:\/\//, '' )
			.replace( /\/wp-admin/, '' );
	}

	// Other Jetpack site
	const siteName = this.getAccountConfig( 'jetpackUser' + host )[ 2 ];
	return siteName.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
}

export function getTestCreditCardDetails() {
	return {
		cardHolder: 'End To End Testing',
		cardType: 'VISA',
		cardNumber: '4242 4242 4242 4242', // https://stripe.com/docs/testing#cards
		cardExpiry: '02 / 28',
		cardCVV: '300',
		cardCountryCode: 'TR', // using Turkey to force Stripe as payment processor
		cardPostCode: '4000',
	};
}

export function getTestDomainRegistarDetails( emailAddress ) {
	return {
		firstName: 'End to End',
		lastName: 'Testing',
		emailAddress: emailAddress,
		phoneNumber: '0422 888 888',
		countryCode: 'AU',
		address: '888 Queen Street',
		city: 'Brisbane',
		stateCode: 'QLD',
		postalCode: '4000',
	};
}

export function getCalypsoURL( route = '', queryStrings = [], { forceWpCalypso = false } = {} ) {
	let queryString = '';
	let baseURL = this.configGet( 'calypsoBaseURL' );
	if ( forceWpCalypso && baseURL === 'https://wordpress.com' ) {
		baseURL = 'https://wpcalypso.wordpress.com';
	}
	const url = baseURL + '/' + route;

	for ( const qs of queryStrings ) {
		queryString = this._appendQueryString( queryString, qs );
	}

	return url + queryString;
}

export function _appendQueryString( existingQueryString, queryStringPair ) {
	if ( existingQueryString === '' ) {
		return `?${ queryStringPair }`;
	}
	return `${ existingQueryString }&${ queryStringPair }`;
}

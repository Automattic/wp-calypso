/**
 * External dependencies
 */
import debugFactory from 'debug';
import { every, get, includes, isArray, keys, reduce, some } from 'lodash';
import store from 'store';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import activeTests from 'lib/abtest/active-tests';
import { recordTracksEvent } from 'lib/analytics/tracks';
import userFactory from 'lib/user';
import wpcom from 'lib/wp';
import { ABTEST_LOCALSTORAGE_KEY } from 'lib/abtest/utility';
import { getLanguageSlugs } from 'lib/i18n-utils/utils';

const debug = debugFactory( 'calypso:abtests' );
const user = userFactory();

function ABTest( name, geoLocation ) {
	if ( ! ( this instanceof ABTest ) ) {
		return new ABTest( name, geoLocation );
	}

	this.init( name, geoLocation );
}

/**
 * Returns a user's variation, setting it if he or she is not already a participant
 *
 * @param {string} name - The name of the A/B test
 * @param {string} geoLocation - Location of current user
 * @returns {string} - The user's variation
 */
export const abtest = ( name, geoLocation = false ) =>
	new ABTest( name, geoLocation ).getVariationAndSetAsNeeded();

/**
 * Returns a user's variation
 *
 * @param {string} name - The name of the A/B test
 * @returns {string} - The user's variation or null if the user is not a participant
 */
export const getABTestVariation = ( name ) => new ABTest( name ).getVariation();

/**
 * Returns a user's variations from localStorage.
 *
 * @returns {object} - The user's variations, or an empty object if the user is not a participant
 */
export const getSavedVariations = () => store.get( ABTEST_LOCALSTORAGE_KEY ) || {};

/**
 * Save the variation for a test - useful for testing!
 *
 * @param {string} name - The name of the A/B test
 * @param {string} variation - The test variation to save
 * @returns {undefined}
 */
export const saveABTestVariation = ( name, variation ) =>
	new ABTest( name ).saveVariation( variation );

export const getAllTests = () => keys( activeTests ).map( ABTest );

const isUserSignedIn = () => user && user.get() !== false;

const parseDateStamp = ( datestamp ) => {
	const format = 'YYYYMMDD';

	if ( datestamp.length === format.length ) {
		const year = datestamp.substr( 0, 4 );
		const month = datestamp.substr( 4, 2 );
		const day = datestamp.substr( 6, 2 );
		const toParse = `${ year }-${ month }-${ day }`;

		const date = Date.parse( toParse );

		if ( ! isNaN( date ) ) {
			return date;
		}
	}

	throw new Error( `The date ${ datestamp } should be in the ${ format } format` );
};

const languageSlugs = getLanguageSlugs();
const langSlugIsValid = ( slug ) => languageSlugs.indexOf( slug ) !== -1;

ABTest.prototype.init = function ( name, geoLocation ) {
	if ( ! /^[A-Za-z\d]+$/.test( name ) ) {
		throw new Error( 'The test name "' + name + '" should be camel case' );
	}

	const testConfig = activeTests[ name ];

	if ( ! testConfig ) {
		throw new Error( 'No A/B test configuration data found for ' + name );
	}

	const variationDetails = testConfig.variations;
	const assignmentMethod =
		typeof testConfig.assignmentMethod !== 'undefined' ? testConfig.assignmentMethod : 'default';
	const variationNames = keys( variationDetails );
	if ( ! variationDetails || variationNames.length === 0 ) {
		throw new Error( 'No A/B test variations found for ' + name );
	}

	if ( ! testConfig.defaultVariation ) {
		throw new Error( 'No default variation found for ' + name );
	}

	if ( ! includes( variationNames, testConfig.defaultVariation ) ) {
		throw new Error(
			'A default variation is specified for ' + name + ' but it is not part of the variations'
		);
	}

	// Default: only run for 'en' locale.
	this.localeTargets = [ 'en' ];
	if ( testConfig.localeTargets ) {
		if ( 'any' === testConfig.localeTargets ) {
			// Allow any locales.
			this.localeTargets = false;
		} else if (
			isArray( testConfig.localeTargets ) &&
			every( testConfig.localeTargets, langSlugIsValid )
		) {
			// Allow specific locales.
			this.localeTargets = testConfig.localeTargets;
		} else {
			throw new Error(
				'localeTargets can be either "any" or an array of one or more valid language slugs'
			);
		}
	}

	this.localeExceptions = false;
	if (
		testConfig.localeExceptions &&
		isArray( testConfig.localeExceptions ) &&
		every( testConfig.localeExceptions, langSlugIsValid )
	) {
		this.localeExceptions = testConfig.localeExceptions;
	}

	const variationDatestamp = testConfig.datestamp;

	this.name = name;
	this.datestamp = variationDatestamp;
	this.startDate = parseDateStamp( variationDatestamp );
	this.variationDetails = variationDetails;
	this.defaultVariation = testConfig.defaultVariation;
	this.variationNames = variationNames;
	this.assignmentMethod = assignmentMethod;
	this.experimentId = name + '_' + variationDatestamp;

	if ( testConfig.countryCodeTargets ) {
		if ( false !== geoLocation ) {
			this.countryCodeTargets = testConfig.countryCodeTargets;
			this.geoLocation = geoLocation;
		} else {
			throw new Error(
				'Test config has countryCodeTargets, but no geoLocation passed to abtest function'
			);
		}
	}

	this.allowExistingUsers = testConfig.allowExistingUsers === true;
};

ABTest.prototype.getVariationAndSetAsNeeded = function () {
	if ( 'test' === process.env.NODE_ENV ) {
		return this.defaultVariation;
	}

	const savedVariation = this.getSavedVariation( this.experimentId );

	if ( ! this.hasTestStartedYet() ) {
		debug( '%s: Test will start on %s.', this.experimentId, this.datestamp );
		return savedVariation || this.defaultVariation;
	}

	if ( savedVariation && includes( this.variationNames, savedVariation ) ) {
		debug( '%s: existing variation: "%s"', this.experimentId, savedVariation );
		return savedVariation;
	}

	if ( ! this.isEligibleForAbTest() ) {
		debug( '%s: User is ineligible to participate in A/B test', this.experimentId );
		return this.defaultVariation;
	}

	const newVariation = this.assignVariation();
	this.saveVariation( newVariation );
	debug( '%s: new variation: "%s"', this.experimentId, newVariation );
	return newVariation;
};

ABTest.prototype.getVariation = function () {
	return this.getSavedVariation( this.experimentId );
};

export const isUsingGivenLocales = ( localeTargets, experimentId = null ) => {
	const client = typeof navigator !== 'undefined' ? window.navigator : {};
	const clientLanguage = client.language || client.userLanguage || 'en';
	const clientLanguagesPrimary =
		client.languages && client.languages.length ? client.languages[ 0 ] : 'en';
	const localeFromSession = getLocaleSlug() || 'en';
	const localeMatcher = new RegExp( '^(' + localeTargets.join( '|' ) + ')', 'i' );
	const userLocale = user.get().localeSlug || 'en';

	if ( isUserSignedIn() && ! userLocale.match( localeMatcher ) ) {
		debug( '%s: User has a %s locale', experimentId, userLocale );
		return false;
	}

	if ( ! isUserSignedIn() && ! clientLanguage.match( localeMatcher ) ) {
		debug( '%s: Logged-out user has a %s navigator.language preference', experimentId, userLocale );
		return false;
	}

	if ( ! isUserSignedIn() && ! clientLanguagesPrimary.match( localeMatcher ) ) {
		debug(
			'%s: Logged-out user has a %s navigator.languages primary preference',
			experimentId,
			userLocale
		);
		return false;
	}

	if ( ! isUserSignedIn() && ! localeFromSession.match( localeMatcher ) ) {
		debug( '%s: Logged-out user has the %s locale in session', experimentId, userLocale );
		return false;
	}

	return true;
};

ABTest.prototype.isEligibleForAbTest = function () {
	if ( ! store.enabled ) {
		debug( '%s: Local storage is not enabled', this.experimentId );
		return false;
	}

	if ( this.localeTargets && ! isUsingGivenLocales( this.localeTargets, this.experimentId ) ) {
		return false;
	} else if (
		this.localeExceptions &&
		isUsingGivenLocales( this.localeExceptions, this.experimentId )
	) {
		return false;
	}

	if ( this.countryCodeTargets ) {
		if ( this.countryCodeTargets.indexOf( this.geoLocation ) === -1 ) {
			debug(
				'%s: geoLocation is %s, test targets: %s',
				this.experimentId,
				this.geoLocation,
				this.countryCodeTargets.join( ', ' )
			);
			return false;
		}
	}

	if ( this.hasBeenInPreviousSeriesTest() ) {
		debug( '%s: User has been in a previous series test', this.experimentId );
		return false;
	}

	// limit the test to new users unless the test explicitly allows anyone
	if ( this.hasRegisteredBeforeTestBegan() && ! this.allowExistingUsers ) {
		debug( '%s: User was registered before the test began', this.experimentId );
		return false;
	}

	return true;
};

ABTest.prototype.hasTestStartedYet = function () {
	return new Date() > new Date( this.startDate );
};

ABTest.prototype.hasBeenInPreviousSeriesTest = function () {
	const previousExperimentIds = keys( getSavedVariations() );
	let previousName;

	return some(
		previousExperimentIds,
		function ( previousExperimentId ) {
			previousName = previousExperimentId.substring(
				0,
				previousExperimentId.length - '_YYYYMMDD'.length
			);
			return previousExperimentId !== this.experimentId && previousName === this.name;
		}.bind( this )
	);
};

ABTest.prototype.hasRegisteredBeforeTestBegan = function () {
	return user && user.get() && new Date( user.get().date ) < new Date( this.startDate );
};

ABTest.prototype.getSavedVariation = function () {
	return getSavedVariations()[ this.experimentId ] || null;
};

ABTest.prototype.assignVariation = function () {
	let variationName, randomAllocationAmount;
	let sum = 0;

	const userId = get( user, 'data.ID' );
	const allocationsTotal = reduce(
		this.variationDetails,
		( allocations, allocation ) => {
			return allocations + allocation;
		},
		0
	);

	if ( this.assignmentMethod === 'userId' && ! isNaN( +userId ) ) {
		randomAllocationAmount = Number( user.data.ID ) % allocationsTotal;
	} else {
		randomAllocationAmount = Math.random() * allocationsTotal;
	}

	for ( variationName in this.variationDetails ) {
		sum += this.variationDetails[ variationName ];
		if ( randomAllocationAmount < sum ) {
			return variationName;
		}
	}
};

ABTest.prototype.recordVariation = function ( variation ) {
	recordTracksEvent( 'calypso_abtest_start', {
		abtest_name: this.experimentId,
		abtest_variation: variation,
	} );
};

ABTest.prototype.saveVariation = function ( variation ) {
	if ( isUserSignedIn() ) {
		// Note that for logged-in users, we fire the Tracks event from the API abtest endpoint
		// to ensure that the numbers match up exactly with the user attributes data
		this.saveVariationOnBackend( variation );
	} else {
		this.recordVariation( variation );
	}
	this.saveVariationInLocalStorage( variation );
};

ABTest.prototype.saveVariationOnBackend = function ( variation ) {
	wpcom.undocumented().saveABTestData(
		this.experimentId,
		variation,
		function ( error ) {
			if ( error ) {
				debug( '%s: Error saving variation %s: %s', this.experimentId, variation, error );
			} else {
				debug( '%s: Variation saved successfully: %s.', this.experimentId, variation );
			}
		}.bind( this )
	);
};

ABTest.prototype.saveVariationInLocalStorage = function ( variation ) {
	const savedVariations = getSavedVariations();
	savedVariations[ this.experimentId ] = variation;
	store.set( ABTEST_LOCALSTORAGE_KEY, savedVariations );
};

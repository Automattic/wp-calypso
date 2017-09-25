/**
 * External dependencies
 */
import debugFactory from 'debug';
import { every, get, includes, isArray, keys, map, reduce, some } from 'lodash';
import store from 'store';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import activeTests from 'lib/abtest/active-tests';
import analytics from 'lib/analytics';
import config from 'config';
import userFactory from 'lib/user';
import wpcom from 'lib/wp';

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
 * @param {String} name - The name of the A/B test
 * @param {String} geoLocation - Location of current user
 * @returns {String} - The user's variation
 */
export const abtest = ( name, geoLocation = false ) => new ABTest( name, geoLocation ).getVariationAndSetAsNeeded();

/**
 * Returns a user's variation
 *
 * @param {String} name - The name of the A/B test
 * @returns {String} - The user's variation or null if the user is not a participant
 */
export const getABTestVariation = ( name ) => new ABTest( name ).getVariation();

/**
 * Returns a user's variations from localStorage.
 *
 * @returns {Object} - The user's variations, or an empty object if the user is not a participant
 */
export const getSavedVariations = () => ( store.get( 'ABTests' ) || {} );

export const getAllTests = () => keys( activeTests ).map( ABTest );

const isUserSignedIn = () => user.get() !== false;

const parseDateStamp = ( datestamp ) => {
	const date = i18n.moment( datestamp, 'YYYYMMDD' );

	if ( ! date.isValid() ) {
		throw new Error( 'The date ' + datestamp + ' should be in the YYYYMMDD format' );
	}

	return date;
};

const languageSlugs = map( config( 'languages' ), 'langSlug' );
const langSlugIsValid = ( slug ) => languageSlugs.indexOf( slug ) !== -1;

ABTest.prototype.init = function( name, geoLocation ) {
	if ( ! /^[A-Za-z\d]+$/.test( name ) ) {
		throw new Error( 'The test name "' + name + '" should be camel case' );
	}

	const testConfig = activeTests[ name ];

	if ( ! testConfig ) {
		throw new Error( 'No A/B test configuration data found for ' + name );
	}

	const variationDetails = testConfig.variations;
	const assignmentMethod = ( typeof testConfig.assignmentMethod !== 'undefined' ) ? testConfig.assignmentMethod : 'default';
	const variationNames = keys( variationDetails );
	if ( ! variationDetails || variationNames.length === 0 ) {
		throw new Error( 'No A/B test variations found for ' + name );
	}

	if ( ! testConfig.defaultVariation ) {
		throw new Error( 'No default variation found for ' + name );
	}

	if ( ! includes( variationNames, testConfig.defaultVariation ) ) {
		throw new Error( 'A default variation is specified for ' + name + ' but it is not part of the variations' );
	}

	// Default: only run for 'en' locale.
	this.localeTargets = [ 'en' ];
	if ( testConfig.localeTargets ) {
		if ( 'any' === testConfig.localeTargets ) {
			// Allow any locales.
			this.localeTargets = false;
		} else if ( isArray( testConfig.localeTargets ) && every( testConfig.localeTargets, langSlugIsValid ) ) {
			// Allow specific locales.
			this.localeTargets = testConfig.localeTargets;
		} else {
			throw new Error( 'localeTargets can be either "any" or an array of one or more valid language slugs' );
		}
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

	if ( testConfig.countryCodeTarget ) {
		if ( false !== geoLocation ) {
			this.countryCodeTarget = testConfig.countryCodeTarget;
			this.geoLocation = geoLocation;
		} else {
			throw new Error( 'Test config has geoTarget, but no geoLocation passed to abtest function' );
		}
	}

	this.allowExistingUsers = testConfig.allowExistingUsers === true;
};

ABTest.prototype.getVariationAndSetAsNeeded = function() {
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

ABTest.prototype.getVariation = function() {
	return this.getSavedVariation( this.experimentId );
};

ABTest.prototype.isEligibleForAbTest = function() {
	const client = ( typeof navigator !== 'undefined' ) ? navigator : {};
	const clientLanguage = client.language || client.userLanguage || 'en';
	const clientLanguagesPrimary = ( client.languages && client.languages.length ) ? client.languages[ 0 ] : 'en';
	const localeFromSession = i18n.getLocaleSlug() || 'en';

	if ( ! store.enabled ) {
		debug( '%s: Local storage is not enabled', this.experimentId );
		return false;
	}

	if ( this.localeTargets ) {
		const localeMatcher = new RegExp( '^(' + this.localeTargets.join( '|' ) + ')', 'i' );
		const userLocale = user.get().localeSlug || 'en';

		if ( isUserSignedIn() && ! userLocale.match( localeMatcher ) ) {
			debug( '%s: User has a %s locale', this.experimentId, userLocale );
			return false;
		}
		if ( ! isUserSignedIn() && ! clientLanguage.match( localeMatcher ) ) {
			debug( '%s: Logged-out user has a %s navigator.language preference', this.experimentId, userLocale );
			return false;
		}
		if ( ! isUserSignedIn() && ! clientLanguagesPrimary.match( localeMatcher ) ) {
			debug( '%s: Logged-out user has a %s navigator.languages primary preference', this.experimentId, userLocale );
			return false;
		}
		if ( ! isUserSignedIn() && ! localeFromSession.match( localeMatcher ) ) {
			debug( '%s: Logged-out user has the %s locale in session', this.experimentId, userLocale );
			return false;
		}
	}

	if ( this.countryCodeTarget && this.countryCodeTarget !== this.geoLocation ) {
		debug( '%s: geoLocation is %s, test targets %s', this.experimentId, this.geoLocation, this.countryCodeTarget );
		return false;
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

ABTest.prototype.hasTestStartedYet = function() {
	return ( i18n.moment().isAfter( this.startDate ) );
};

ABTest.prototype.hasBeenInPreviousSeriesTest = function() {
	const previousExperimentIds = keys( getSavedVariations() );
	let previousName;

	return some( previousExperimentIds, function( previousExperimentId ) {
		previousName = previousExperimentId.substring( 0, previousExperimentId.length - '_YYYYMMDD'.length );
		return ( previousExperimentId !== this.experimentId ) && ( previousName === this.name );
	}.bind( this ) );
};

ABTest.prototype.hasRegisteredBeforeTestBegan = function() {
	return user.get() && i18n.moment( user.get().date ).isBefore( this.startDate );
};

ABTest.prototype.getSavedVariation = function() {
	return getSavedVariations()[ this.experimentId ] || null;
};

ABTest.prototype.assignVariation = function() {
	let variationName, randomAllocationAmount;
	let sum = 0;

	const userId = get( user, 'data.ID' );
	const allocationsTotal = reduce( this.variationDetails, ( allocations, allocation ) => {
		return allocations + allocation;
	}, 0 );

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

ABTest.prototype.recordVariation = function( variation ) {
	analytics.tracks.recordEvent( 'calypso_abtest_start', { abtest_name: this.experimentId, abtest_variation: variation } );
};

ABTest.prototype.saveVariation = function( variation ) {
	if ( isUserSignedIn() ) {
		// Note that for logged-in users, we fire the Tracks event from the API abtest endpoint
		// to ensure that the numbers match up exactly with the user attributes data
		this.saveVariationOnBackend( variation );
	} else {
		this.recordVariation( variation );
	}
	this.saveVariationInLocalStorage( variation );
};

ABTest.prototype.saveVariationOnBackend = function( variation ) {
	wpcom.undocumented().saveABTestData( this.experimentId, variation, function( error ) {
		if ( error ) {
			debug( '%s: Error saving variation %s: %s', this.experimentId, variation, error );
		} else {
			debug( '%s: Variation saved successfully: %s.', this.experimentId, variation );
		}
	}.bind( this ) );
};

ABTest.prototype.saveVariationInLocalStorage = function( variation ) {
	const savedVariations = getSavedVariations();
	savedVariations[ this.experimentId ] = variation;
	store.set( 'ABTests', savedVariations );
};

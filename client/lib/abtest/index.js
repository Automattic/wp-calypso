/**
 * External dependencies
 */
import debugFactory from 'debug';
import { includes, keys, reduce, some } from 'lodash';
import store from 'store';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import activeTests from 'lib/abtest/active-tests';
import analytics from 'lib/analytics';
import userFactory from 'lib/user';
import wpcom from 'lib/wp';
import sitesList from 'lib/sites-list';
import { PLAN_FREE } from 'lib/plans/constants';

const debug = debugFactory( 'calypso:abtests' );
const user = userFactory();
const sites = sitesList();

function ABTest( name ) {
	if ( ! ( this instanceof ABTest ) ) {
		return new ABTest( name );
	}

	this.init( name );
}

/**
 * Returns a user's variation, setting it if he or she is not already a participant
 *
 * @param {String} name - The name of the A/B test
 * @returns {String} - The user's variation
 */
export const abtest = ( name ) => new ABTest( name ).getVariationAndSetAsNeeded();

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

ABTest.prototype.init = function( name ) {
	if ( ! /^[A-Za-z\d]+$/.test( name ) ) {
		throw new Error( 'The test name "' + name + '" should be camel case' );
	}

	const testConfig = activeTests[ name ];

	if ( ! testConfig ) {
		throw new Error( 'No A/B test configuration data found for ' + name );
	}

	const variationDetails = testConfig.variations;
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

	const variationDatestamp = testConfig.datestamp;

	this.name = name;
	this.datestamp = variationDatestamp;
	this.startDate = parseDateStamp( variationDatestamp );
	this.variationDetails = variationDetails;
	this.defaultVariation = testConfig.defaultVariation;
	this.variationNames = variationNames;
	this.experimentId = name + '_' + variationDatestamp;
	this.excludeJetpackSites = testConfig.excludeJetpackSites === true;
	this.excludeSitesWithPaidPlan = testConfig.excludeSitesWithPaidPlan === true;
	this.allowAnyLocale = testConfig.allowAnyLocale === true;
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
	const selectedSite = sites.getSelectedSite();
	const client = ( typeof navigator !== 'undefined' ) ? navigator : {};
	const clientLanguage = client.language || client.userLanguage || 'en';
	const clientLanguagesPrimary = ( client.languages && client.languages.length ) ? client.languages[ 0 ] : 'en';
	const localeFromSession = i18n.getLocaleSlug() || 'en';
	const englishMatcher = /^en-?/i;

	if ( ! store.enabled ) {
		debug( '%s: Local storage is not enabled', this.experimentId );
		return false;
	}

	if ( ! this.allowAnyLocale ) {
		if ( isUserSignedIn() && user.get().localeSlug !== 'en' ) {
			debug( '%s: User has a non-English locale', this.experimentId );
			return false;
		}
		if ( ! isUserSignedIn() && ! clientLanguage.match( englishMatcher ) ) {
			debug( '%s: Logged-out user has a non-English navigator.language preference', this.experimentId );
			return false;
		}
		if ( ! isUserSignedIn() && ! clientLanguagesPrimary.match( englishMatcher ) ) {
			debug( '%s: Logged-out user has a non-English navigator.languages primary preference', this.experimentId );
			return false;
		}
		if ( ! isUserSignedIn() && ! localeFromSession.match( englishMatcher ) ) {
			debug( '%s: Logged-out user has a non-English locale in session', this.experimentId );
			return false;
		}
	}

	if ( this.excludeJetpackSites && selectedSite && selectedSite.jetpack ) {
		debug( '%s: Jetpack site detected when excludeJetpackSites is set to true', this.experimentId );
		return false;
	}

	if ( this.excludeSitesWithPaidPlan && selectedSite && selectedSite.plan.product_slug !== PLAN_FREE ) {
		debug( '%s: Site with paid plan detected when excludeSitesWithPaidPlan is set to true', this.experimentId );
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
	let variationName;
	let sum = 0;

	const allocationsTotal = reduce( this.variationDetails, ( allocations, allocation ) => {
		return allocations + allocation;
	}, 0 );

	const randomAllocationAmount = Math.random() * allocationsTotal;

	for ( variationName in this.variationDetails ) {
		sum += this.variationDetails[ variationName ];
		if ( randomAllocationAmount <= sum ) {
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

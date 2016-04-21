/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:abtests' ),
	includes = require( 'lodash/includes' ),
	keys = require( 'lodash/keys' ),
	reduce = require( 'lodash/reduce' ),
	some = require( 'lodash/some' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var activeTests = require( './active-tests' ),
	analytics = require( 'lib/analytics' ),
	i18n = require( 'lib/mixins/i18n' ),
	user = require( 'lib/user' )(),
	wpcom = require( 'lib/wp' ),
	sites = require( 'lib/sites-list' )();

import { PLAN_FREE } from 'lib/plans/constants';

function ABTest( name ) {
	if ( ! ( this instanceof ABTest ) ) {
		return new ABTest( name );
	}

	this.init( name );
}

ABTest.prototype.init = function( name ) {
	var testConfig, variationDetails, variationNames, variationDatestamp;

	if ( ! /^[A-Za-z\d]+$/.test( name ) ) {
		throw new Error( 'The test name "' + name + '" should be camel case' );
	}

	testConfig = activeTests[ name ];

	if ( ! testConfig ) {
		throw new Error( 'No A/B test configuration data found for ' + name );
	}

	variationDetails = testConfig.variations;
	variationNames = keys( variationDetails );
	if ( ! variationDetails || variationNames.length === 0 ) {
		throw new Error( 'No A/B test variations found for ' + name );
	}

	if ( ! testConfig.defaultVariation ) {
		throw new Error( 'No default variation found for ' + name );
	}

	if ( ! includes( variationNames, testConfig.defaultVariation ) ) {
		throw new Error( 'A default variation is specified for ' + name + ' but it is not part of the variations' );
	}

	variationDatestamp = testConfig.datestamp;

	this.name = name;
	this.datestamp = variationDatestamp;
	this.startDate = this.parseDatestamp( variationDatestamp );
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
	var savedVariation = this.getSavedVariation( this.experimentId ),
		newVariation;

	if ( ! this.hasTestStartedYet() ) {
		debug( '%s: Test will start on %s.', this.experimentId, this.datestamp );
		return this.defaultVariation;
	}

	if ( savedVariation && includes( this.variationNames, savedVariation ) ) {
		debug( '%s: existing variation: "%s"', this.experimentId, savedVariation );
		return savedVariation;
	}

	if ( ! this.isEligibleForAbTest() ) {
		debug( '%s: User is ineligible to participate in A/B test', this.experimentId );
		return this.defaultVariation;
	}

	newVariation = this.assignVariation();
	this.saveVariation( newVariation );
	debug( '%s: new variation: "%s"', this.experimentId, newVariation );
	return newVariation;
};

ABTest.prototype.getVariation = function() {
	return this.getSavedVariation( this.experimentId );
};

ABTest.prototype.isEligibleForAbTest = function() {
	var selectedSite = sites.getSelectedSite();

	if ( ! store.enabled ) {
		debug( '%s: Local storage is not enabled', this.experimentId );
		return false;
	}

	if ( ! this.allowAnyLocale && this.isUserSignedIn() &&
			user.get().localeSlug !== 'en' ) {
		debug( '%s: User has a non-English locale', this.experimentId );
		return false;
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

ABTest.prototype.parseDatestamp = function( datestamp ) {
	var date = i18n.moment( datestamp, 'YYYYMMDD' );

	if ( ! date.isValid() ) {
		throw new Error( 'The date ' + datestamp + ' should be in the YYYYMMDD format' );
	}

	return date;
};

ABTest.prototype.hasTestStartedYet = function() {
	return ( i18n.moment().isAfter( this.startDate ) );
};

ABTest.prototype.isUserSignedIn = function() {
	return user.get() !== false;
};

ABTest.prototype.hasBeenInPreviousSeriesTest = function() {
	var previousExperimentIds = keys( getSavedVariations() ),
		previousName;

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
	var allocationsTotal, randomAllocationAmount, variationName,
		sum = 0;

	allocationsTotal = reduce( this.variationDetails, function( allocations, allocation ) {
		return allocations + allocation;
	}, 0 );

	randomAllocationAmount = Math.random() * allocationsTotal;

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
	if ( this.isUserSignedIn() ) {
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
	var savedVariations = getSavedVariations();

	savedVariations[ this.experimentId ] = variation;
	store.set( 'ABTests', savedVariations );
};

/**
 * Returns a user's variation, setting it if he or she is not already a participant
 *
 * @param {String} name - The name of the A/B test
 * @returns {String} - The user's variation
 */
function abtest( name ) {
	return new ABTest( name ).getVariationAndSetAsNeeded();
}

/**
 * Returns a user's variation
 *
 * @param {String} name - The name of the A/B test
 * @returns {String} - The user's variation or null if the user is not a participant
 */
function getABTestVariation( name ) {
	return new ABTest( name ).getVariation();
}

/**
 * Returns a user's variations from localStorage.
 *
 * @returns {Object} - The user's variations, or an empty object if the user is not a participant
 */
function getSavedVariations() {
	return store.get( 'ABTests' ) || {};
}

module.exports = {
	abtest: abtest,
	getABTestVariation: getABTestVariation,
	getSavedVariations: getSavedVariations
};

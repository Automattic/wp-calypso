/**
 * External dependencies
 */
import assign from 'lodash/assign';
import defer from 'lodash/defer';
import isEmpty from 'lodash/isEmpty';
import async from 'async';
import { parse as parseURL } from 'url';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import wpcom from 'lib/wp' ;
const sites = require( 'lib/sites-list' )();
const user = require( 'lib/user' )();
import { getSavedVariations } from 'lib/abtest';
import SignupCart from 'lib/signup/cart';
import { startFreeTrial } from 'lib/upgrades/actions';
import { PLAN_PREMIUM } from 'lib/plans/constants';
import analytics from 'lib/analytics';

import {
	SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET,
} from 'state/action-types';

import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSurveyVertical, getSurveySiteType } from 'state/signup/steps/survey/selectors';

function createCart( callback, dependencies, data ) {
	const { designType } = dependencies;
	const { domainItem, themeItem } = data;

	if ( designType === 'domain' ) {
		// TODO: Find a way to create cart without a site
		// SignupCart.addToCart depends on the site's slug
		callback( undefined, [ null, null, domainItem, themeItem ] );
	} else {
		createSiteWithCart( callback, dependencies, data );
	}
}

function createSiteWithCart( callback, dependencies, {
	cartItem,
	domainItem,
	googleAppsCartItem,
	isPurchasingItem,
	siteUrl,
	themeSlugWithRepo,
	themeItem
} ) {
	const siteTitle = getSiteTitle( this._reduxStore.getState() ).trim();
	const surveyVertical = getSurveyVertical( this._reduxStore.getState() ).trim();

	wpcom.undocumented().sitesNew( {
		blog_name: siteUrl,
		blog_title: siteTitle,
		options: {
			// the theme can be provided in this step's dependencies or the
			// step object itself depending on if the theme is provided in a
			// query. See `getThemeSlug` in `DomainsStep`.
			theme: dependencies.themeSlugWithRepo || themeSlugWithRepo,
			vertical: surveyVertical || undefined,
		},
		validate: false,
		find_available_url: isPurchasingItem
	}, function( error, response ) {
		if ( error ) {
			callback( error );

			return;
		}

		const parsedBlogURL = parseURL( response.blog_details.url );

		const siteSlug = parsedBlogURL.hostname;
		const siteId = response.blog_details.blogid;
		const isFreeThemePreselected = startsWith( themeSlugWithRepo, 'pub' ) && ! themeItem;
		const providedDependencies = {
			siteId,
			siteSlug,
			domainItem,
			themeItem
		};
		const addToCartAndProceed = () => {
			const newCartItems = [
				cartItem,
				domainItem,
				googleAppsCartItem,
				themeItem,
			].filter( item => item );

			if ( newCartItems.length ) {
				SignupCart.addToCart( siteSlug, newCartItems, function( cartError ) {
					callback( cartError, providedDependencies );
				} );
			} else {
				callback( undefined, providedDependencies );
			}
		};

		if ( ! user.get() && isFreeThemePreselected ) {
			setThemeOnSite( addToCartAndProceed, { siteSlug, themeSlugWithRepo } );
		} else if ( user.get() && isFreeThemePreselected ) {
			fetchSitesAndUser( siteSlug, setThemeOnSite.bind( this, addToCartAndProceed, { siteSlug, themeSlugWithRepo } ) );
		} else if ( user.get() ) {
			fetchSitesAndUser( siteSlug, addToCartAndProceed );
		} else {
			addToCartAndProceed();
		}
	} );
}

/**
 * Adds a Premium with free trial to the shopping cart.
 *
 * @param {function} callback - function to execute when action completes
 * @param {object} dependencies - data provided to the current step
 * @param {object} data - additional data provided by the current step
 */
function startFreePremiumTrial( callback, dependencies, data ) {
	const { siteId } = dependencies;

	startFreeTrial( siteId, cartItems.planItem( PLAN_PREMIUM ), ( error ) => {
		if ( error ) {
			callback( error, dependencies );
		} else {
			callback( error, dependencies, data );
		}
	} );
}

function fetchSitesUntilSiteAppears( siteSlug, callback ) {
	sites.once( 'change', function() {
		if ( ! sites.select( siteSlug ) ) {
			// if the site isn't in the list then bind to change and fetch again again
			fetchSitesUntilSiteAppears( siteSlug, callback );
		} else {
			callback();
		}
	} );

	// this call is deferred because sites.fetching is not set to false until
	// after sites has emitted a `change` event
	defer( sites.fetch.bind( sites ) );
}

function fetchSitesAndUser( siteSlug, onComplete ) {
	async.parallel( [
		callback => {
			fetchSitesUntilSiteAppears( siteSlug, callback );
		},
		callback => {
			user.once( 'change', callback );
			user.fetch();
		}
	], onComplete );
}

function setThemeOnSite( callback, { siteSlug, themeSlugWithRepo } ) {
	if ( isEmpty( themeSlugWithRepo ) ) {
		defer( callback );

		return;
	}

	wpcom.undocumented().changeTheme( siteSlug, { theme: themeSlugWithRepo.split( '/' )[ 1 ] }, function( errors ) {
		callback( isEmpty( errors ) ? undefined : [ errors ] );
	} );
}

/**
 * Gets username suggestions from the API.
 *
 * Ask the API to validate a username.
 *
 * If the API returns a suggestion, then the username is already taken.
 * If there is no error from the API, then the username is free.
 *
 * @param {string} username The username to get suggestions for.
 * @param {object} reduxState The Redux state object
 */
function getUsernameSuggestion( username, reduxState ) {
	const fields = {
		givesuggestions: 1,
		username: username
	};

	// Clear out the local storage variable before sending the call.
	reduxState.dispatch( {
		type: SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET,
		data: ''
	} );

	wpcom.undocumented().validateNewUser( fields, ( error, response ) => {
		if ( error || ! response ) {
			return null;
		}

		/**
		 * Default the suggested username to `username` because if the validation succeeds would mean
		 * that the username is free
		 */
		let resultingUsername = username;

		/**
		 * Only start checking for suggested username if the API returns an error for the validation.
		 */
		if ( ! response.success ) {
			const { messages } = response;

			/**
			 * The only case we want to update username field is when the username is already taken.
			 *
			 * This ensures that the validation is done
			 *
			 * Check for:
			 *    - username taken error -
			 *    - a valid suggested username
			 */
			if ( messages.username && messages.username.taken && messages.suggested_username ) {
				resultingUsername = messages.suggested_username.data;
			}
		}

		// Save the suggested username for later use
		reduxState.dispatch( {
			type: SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET,
			data: resultingUsername
		} );
	} );
}

module.exports = {
	createCart,

	createSiteWithCart,

	createSiteWithCartAndStartFreeTrial( callback, dependencies, data ) {
		createSiteWithCart( ( error, providedDependencies ) => {
			if ( error ) {
				callback( error, providedDependencies );
			} else {
				startFreePremiumTrial( callback, providedDependencies, data );
			}
		}, dependencies, data );
	},

	addPlanToCart( callback, { siteSlug }, { cartItem, privacyItem } ) {
		if ( isEmpty( cartItem ) ) {
			// the user selected the free plan
			defer( callback );

			return;
		}

		const newCartItems = [ cartItem, privacyItem ].filter( item => item );

		SignupCart.addToCart( siteSlug, newCartItems, callback );
	},

	createAccount( callback, dependencies, { userData, flowName, queryArgs } ) {
		const surveyVertical = getSurveyVertical( this._reduxStore.getState() ).trim();
		const surveySiteType = getSurveySiteType( this._reduxStore.getState() ).trim();

		wpcom.undocumented().usersNew( assign(
			{}, userData, {
				ab_test_variations: getSavedVariations(),
				validate: false,
				signup_flow_name: flowName,
				nux_q_site_type: surveySiteType,
				nux_q_question_primary: surveyVertical,
				jetpack_redirect: queryArgs.jetpackRedirect
			}
		), ( error, response ) => {
			var errors = error && error.error ? [ { error: error.error, message: error.message } ] : undefined,
				bearerToken = error && error.error ? {} : { bearer_token: response.bearer_token };

			if ( ! errors ) {
				// Fire after a new user registers.
				analytics.tracks.recordEvent( 'calypso_user_registration_complete' );
				analytics.ga.recordEvent( 'Signup', 'calypso_user_registration_complete' );
			}

			callback( errors, assign( {}, { username: userData.username }, bearerToken ) );
		} );
	},

	createSite( callback, { themeSlugWithRepo }, { site } ) {
		var data = {
			blog_name: site,
			blog_title: '',
			options: { theme: themeSlugWithRepo },
			validate: false
		};

		wpcom.undocumented().sitesNew( data, function( errors, response ) {
			let providedDependencies, siteSlug;

			if ( response && response.blog_details ) {
				const parsedBlogURL = parseURL( response.blog_details.url );
				siteSlug = parsedBlogURL.hostname;

				providedDependencies = { siteSlug };
			}

			if ( user.get() && isEmpty( errors ) ) {
				fetchSitesAndUser( siteSlug, () => {
					callback( undefined, providedDependencies );
				} );
			} else {
				callback( isEmpty( errors ) ? undefined : [ errors ], providedDependencies );
			}
		} );
	},

	setThemeOnSite: setThemeOnSite,

	getUsernameSuggestion: getUsernameSuggestion
};

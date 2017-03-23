/**
 * External dependencies
 */
import assign from 'lodash/assign';
import defer from 'lodash/defer';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';
import async from 'async';
import { parse as parseURL } from 'url';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp' ;
const sites = require( 'lib/sites-list' )();
const user = require( 'lib/user' )();
import { getSavedVariations } from 'lib/abtest';
import SignupCart from 'lib/signup/cart';
import analytics from 'lib/analytics';

import {
	SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET,
} from 'state/action-types';

import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSurveyVertical, getSurveySiteType } from 'state/signup/steps/survey/selectors';

function createSiteOrDomain( callback, dependencies, data, reduxStore ) {
	const { designType, domainItem } = data;

	if ( designType === 'domain' ) {
		const cartKey = 'no-site';
		const providedDependencies = {
			siteId: null,
			siteSlug: cartKey,
			themeSlugWithRepo: null,
			domainItem,
		};

		SignupCart.createCart( cartKey, [ domainItem ], error => callback( error, providedDependencies ) );
	} else {
		createSiteWithCart( ( errors, providedDependencies ) => {
			callback( errors, pick( providedDependencies, [ 'siteId', 'siteSlug', 'themeSlugWithRepo', 'domainItem' ] ) );
		}, dependencies, data, reduxStore );
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
}, reduxStore ) {
	const siteTitle = getSiteTitle( reduxStore.getState() ).trim();
	const surveyVertical = getSurveyVertical( reduxStore.getState() ).trim();

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
				SignupCart.addToCart( siteId, newCartItems, function( cartError ) {
					callback( cartError, providedDependencies );
				} );
			} else {
				callback( undefined, providedDependencies );
			}
		};

		if ( ! user.get() && isFreeThemePreselected ) {
			setThemeOnSite( addToCartAndProceed, { siteSlug, themeSlugWithRepo } );
		} else if ( user.get() && isFreeThemePreselected ) {
			fetchSitesAndUser( siteSlug, setThemeOnSite.bind( null, addToCartAndProceed, { siteSlug, themeSlugWithRepo } ) );
		} else if ( user.get() ) {
			fetchSitesAndUser( siteSlug, addToCartAndProceed );
		} else {
			addToCartAndProceed();
		}
	} );
}

function fetchSitesUntilSiteAppears( siteSlug, callback ) {
	if ( sites.select( siteSlug ) ) {
		callback();
		return;
	}

	sites.once( 'change', function() {
		fetchSitesUntilSiteAppears( siteSlug, callback );
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
	createSiteOrDomain,

	createSiteWithCart,

	addPlanToCart( callback, { siteId }, { cartItem, privacyItem } ) {
		if ( isEmpty( cartItem ) ) {
			// the user selected the free plan
			defer( callback );

			return;
		}

		const newCartItems = [ cartItem, privacyItem ].filter( item => item );

		SignupCart.addToCart( siteId, newCartItems, error => callback( error, { cartItem, privacyItem } ) );
	},

	createAccount( callback, dependencies, { userData, flowName, queryArgs, service, token }, reduxStore ) {
		const surveyVertical = getSurveyVertical( reduxStore.getState() ).trim();
		const surveySiteType = getSurveySiteType( reduxStore.getState() ).trim();

		if ( service ) {
			// We're creating a new social account
			wpcom.undocumented().usersSocialNew( service, token, ( error, response ) => {
				const errors = error && error.error ? [ { error: error.error, message: error.message } ] : undefined;

				if ( errors ) {
					callback( errors );
				} else {
					callback( undefined, response );
				}
			} );
		} else {
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
				const errors = error && error.error ? [ { error: error.error, message: error.message } ] : undefined,
					bearerToken = error && error.error ? {} : { bearer_token: response.bearer_token };

				if ( ! errors ) {
					// Fire after a new user registers.
					analytics.tracks.recordEvent( 'calypso_user_registration_complete' );
					analytics.ga.recordEvent( 'Signup', 'calypso_user_registration_complete' );
				}

				callback( errors, assign( {}, { username: userData.username }, bearerToken ) );
			} );
		}
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

	fetchSitesAndUser: fetchSitesAndUser,

	setThemeOnSite: setThemeOnSite,

	getUsernameSuggestion: getUsernameSuggestion
};

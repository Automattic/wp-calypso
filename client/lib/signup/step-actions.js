/**
 * External dependencies
 */
import assign from 'lodash/assign';
import defer from 'lodash/defer';
import isEmpty from 'lodash/isEmpty';
import async from 'async';
import { parse as parseURL } from 'url';

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

function addDomainItemsToCart( callback, dependencies, { domainItem, googleAppsCartItem, isPurchasingItem, siteUrl, themeSlug, themeSlugWithRepo, themeItem } ) {
	wpcom.undocumented().sitesNew( {
		blog_name: siteUrl,
		blog_title: siteUrl,
		options: {
			theme: dependencies.theme || themeSlugWithRepo
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
		const isFreeThemePreselected = themeSlug && ! themeItem;
		const providedDependencies = {
			siteId,
			siteSlug,
			domainItem,
			themeItem
		};
		const addToCartAndProceed = () => {
			let newCartItems = [];

			if ( domainItem ) {
				newCartItems = [ ...newCartItems, domainItem ];
			}

			if ( googleAppsCartItem ) {
				newCartItems = [ ...newCartItems, googleAppsCartItem ];
			}

			if ( themeItem ) {
				newCartItems = [ ...newCartItems, themeItem ];
			}

			if ( newCartItems.length ) {
				SignupCart.addToCart( siteSlug, newCartItems, function( cartError ) {
					callback( cartError, providedDependencies );
				} );
			} else {
				callback( undefined, providedDependencies );
			}
		};

		if ( ! user.get() && isFreeThemePreselected ) {
			setThemeOnSite( addToCartAndProceed, { siteSlug }, { themeSlug } );
		} else if ( user.get() && isFreeThemePreselected ) {
			fetchSitesAndUser( siteSlug, setThemeOnSite.bind( this, addToCartAndProceed, { siteSlug }, { themeSlug } ) );
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

function setThemeOnSite( callback, { siteSlug }, { themeSlug } ) {
	if ( isEmpty( themeSlug ) ) {
		defer( callback );

		return;
	}

	wpcom.undocumented().changeTheme( siteSlug, { theme: themeSlug }, function( errors ) {
		callback( isEmpty( errors ) ? undefined : [ errors ] );
	} );
}

module.exports = {
	addDomainItemsToCart: addDomainItemsToCart,

	addDomainItemsToCartAndStartFreeTrial( callback, dependencies, data ) {
		addDomainItemsToCart( ( error, providedDependencies ) => {
			if ( error ) {
				callback( error, providedDependencies );
			} else {
				startFreePremiumTrial( callback, providedDependencies, data );
			}
		}, dependencies, data );
	},

	addPlanToCart( callback, { siteSlug }, { cartItem } ) {
		if ( isEmpty( cartItem ) ) {
			// the user selected the free plan
			defer( callback );

			return;
		}

		SignupCart.addToCart( siteSlug, cartItem, callback );
	},

	createAccount( callback, dependencies, { userData, flowName, queryArgs } ) {
		wpcom.undocumented().usersNew( assign(
			{}, userData, {
				ab_test_variations: getSavedVariations(),
				validate: false,
				signup_flow_name: flowName,
				nux_q_site_type: dependencies.surveySiteType,
				nux_q_question_primary: dependencies.surveyQuestion,
				jetpack_redirect: queryArgs.jetpackRedirect
			}
		), ( error, response ) => {
			var errors = error && error.error ? [ { error: error.error, message: error.message } ] : undefined,
				bearerToken = error && error.error ? {} : { bearer_token: response.bearer_token };

			callback( errors, assign( {}, { username: userData.username }, bearerToken ) );
		} );
	},

	createSite( callback, { theme }, { site } ) {
		var data = {
			blog_name: site,
			blog_title: site,
			options: { theme },
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

	setThemeOnSite: setThemeOnSite
};

/**
 * External dependencies
 */
import assign from 'lodash/object/assign';
import defer from 'lodash/function/defer';
import isEmpty from 'lodash/lang/isEmpty';
import async from 'async';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp' ;
const sites = require( 'lib/sites-list' )();
const user = require( 'lib/user' )();
import { getSavedVariations } from 'lib/abtest';
import SignupCart from 'lib/signup/cart';

function fetchSitesUntilSiteAppears( siteSlug, callback ) {
	sites.once( 'change', function() {
		if ( ! sites.select( siteSlug ) ) {
			// if the site isn't in the list then bind to change and fetch again again
			return fetchSitesUntilSiteAppears( siteSlug, callback );
		}

		callback();
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

module.exports = {
	addDomainItemsToCart( callback, dependencies, { domainItem, googleAppsCartItem, isPurchasingItem, siteUrl } ) {
		wpcom.undocumented().sitesNew( {
			blog_name: siteUrl,
			blog_title: siteUrl,
			options: {
				theme: dependencies.theme,
				images: dependencies.images
			},
			validate: false,
			find_available_url: isPurchasingItem
		}, function( error, response ) {
			if ( error ) {
				return callback( error );
			}

			const siteSlug = response.blog_details.blogname + '.wordpress.com',
				providedDependencies = {
					siteSlug,
					domainItem
				},
				addToCartAndProceed = () => {
					if ( isPurchasingItem ) {
						let newCartItems = [ domainItem ];

						if ( googleAppsCartItem ) {
							newCartItems = newCartItems.concat( googleAppsCartItem );
						}

						SignupCart.addToCart( siteSlug, newCartItems, function( cartError ) {
							callback( cartError, providedDependencies );
						} );
					} else {
						callback( [], providedDependencies );
					}
				};

			if ( user.get() ) {
				return fetchSitesAndUser( siteSlug, addToCartAndProceed );
			}

			addToCartAndProceed();
		} );
	},

	addPlanToCart( callback, { siteSlug }, { cartItem } ) {
		if ( isEmpty( cartItem ) ) {
			// the user selected the free plan
			return defer( callback );
		}

		SignupCart.addToCart( siteSlug, cartItem, callback );
	},

	createAccount( callback, dependencies, { userData, flowName, queryArgs } ) {
		return wpcom.undocumented().usersNew( assign(
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
				siteSlug = response.blog_details.blogname + '.wordpress.com';
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

	setThemeOnSite( callback, { siteSlug }, { themeSlug } ) {
		if ( isEmpty( themeSlug ) ) {
			return defer( callback );
		}

		wpcom.undocumented().changeTheme( siteSlug, { theme: themeSlug }, function( errors ) {
			callback( isEmpty( errors ) ? undefined : [ errors ] );
		} );
	}
};

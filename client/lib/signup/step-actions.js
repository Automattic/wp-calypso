/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { assign, defer, get, isEmpty, isNull, omitBy, pick, startsWith } from 'lodash';
import { parse as parseURL } from 'url';
import page from 'page';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
/* eslint-enable no-restricted-imports */
import userFactory from 'lib/user';
const user = userFactory();
import { getSavedVariations } from 'lib/abtest';
import SignupCart from 'lib/signup/cart';
import analytics from 'lib/analytics';
import { SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET } from 'state/action-types';
import { cartItems } from 'lib/cart-values';
import { isDomainTransfer } from 'lib/products-values';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSurveyVertical, getSurveySiteType } from 'state/signup/steps/survey/selectors';
import getSiteId from 'state/selectors/get-site-id';
import { getSiteGoals } from 'state/signup/steps/site-goals/selectors';
import { getUserExperience } from 'state/signup/steps/user-experience/selectors';
import { requestSites } from 'state/sites/actions';
import { supportsPrivacyProtectionPurchase } from 'lib/cart-values/cart-items';
import { getProductsList } from 'state/products-list/selectors';
import { promisify } from '../../utils';

const debug = debugFactory( 'calypso:signup:step-actions' );

export function createSiteOrDomain( callback, dependencies, data, reduxStore ) {
	const { siteId, siteSlug } = data;
	const { cartItem, designType, domainItem, siteUrl, themeSlugWithRepo } = dependencies;

	if ( designType === 'domain' ) {
		const cartKey = 'no-site';
		const providedDependencies = {
			siteId: null,
			siteSlug: cartKey,
			themeSlugWithRepo: null,
			domainItem,
		};

		const domainChoiceCart = [ domainItem ];
		if ( domainItem ) {
			const { product_slug: productSlug } = domainItem;
			const productsList = getProductsList( reduxStore.getState() );
			if ( supportsPrivacyProtectionPurchase( productSlug, productsList ) ) {
				domainChoiceCart.push(
					cartItems.domainPrivacyProtection( {
						domain: domainItem.meta,
						source: 'signup',
					} )
				);
			}
		}

		SignupCart.createCart( cartKey, domainChoiceCart, error =>
			callback( error, providedDependencies )
		);
	} else if ( designType === 'existing-site' ) {
		const providedDependencies = {
			siteId,
			siteSlug,
		};

		SignupCart.createCart(
			siteId,
			omitBy( pick( dependencies, 'domainItem', 'privacyItem', 'cartItem' ), isNull ),
			error => {
				callback( error, providedDependencies );
				page.redirect( `/checkout/${ siteSlug }` );
			}
		);
	} else {
		const newSiteData = {
			cartItem,
			domainItem,
			isPurchasingItem: true,
			siteUrl,
			themeSlugWithRepo,
		};

		createSiteWithCart(
			( errors, providedDependencies ) => {
				callback(
					errors,
					pick( providedDependencies, [ 'siteId', 'siteSlug', 'themeSlugWithRepo', 'domainItem' ] )
				);
			},
			dependencies,
			newSiteData,
			reduxStore
		);
	}
}

export function createSiteWithCart(
	callback,
	dependencies,
	{
		cartItem,
		domainItem,
		googleAppsCartItem,
		isPurchasingItem,
		siteUrl,
		themeSlugWithRepo,
		themeItem,
	},
	reduxStore
) {
	const designType = getDesignType( reduxStore.getState() ).trim();
	const siteTitle = getSiteTitle( reduxStore.getState() ).trim();
	const surveyVertical = getSurveyVertical( reduxStore.getState() ).trim();
	const siteGoals = getSiteGoals( reduxStore.getState() ).trim();

	wpcom.undocumented().sitesNew(
		{
			blog_name: siteUrl,
			blog_title: siteTitle,
			options: {
				designType: designType || undefined,
				// the theme can be provided in this step's dependencies or the
				// step object itself depending on if the theme is provided in a
				// query. See `getThemeSlug` in `DomainsStep`.
				theme: dependencies.themeSlugWithRepo || themeSlugWithRepo,
				vertical: surveyVertical || undefined,
				siteGoals: siteGoals || undefined,
			},
			validate: false,
			find_available_url: isPurchasingItem,
		},
		function( error, response ) {
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
				themeItem,
			};
			const addToCartAndProceed = () => {
				let privacyItem = null;

				if ( domainItem ) {
					const { product_slug: productSlug } = domainItem;
					const productsList = getProductsList( reduxStore.getState() );
					if ( supportsPrivacyProtectionPurchase( productSlug, productsList ) ) {
						if ( isDomainTransfer( domainItem ) ) {
							privacyItem = cartItems.domainTransferPrivacy( {
								domain: domainItem.meta,
								source: 'signup',
							} );
						} else {
							privacyItem = cartItems.domainPrivacyProtection( {
								domain: domainItem.meta,
								source: 'signup',
							} );
						}
					}
				}

				const newCartItems = [
					cartItem,
					domainItem,
					googleAppsCartItem,
					themeItem,
					privacyItem,
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
				fetchSitesAndUser(
					siteSlug,
					setThemeOnSite.bind( null, addToCartAndProceed, { siteSlug, themeSlugWithRepo } ),
					reduxStore
				);
			} else if ( user.get() ) {
				fetchSitesAndUser( siteSlug, addToCartAndProceed, reduxStore );
			} else {
				addToCartAndProceed();
			}
		}
	);
}

function fetchSitesUntilSiteAppears( siteSlug, reduxStore, callback ) {
	if ( getSiteId( reduxStore.getState(), siteSlug ) ) {
		debug( 'fetchReduxSite: found new site' );
		callback();
		return;
	}

	// Have to manually call the thunk in order to access the promise on which
	// to call `then`.
	debug( 'fetchReduxSite: requesting all sites', siteSlug );
	reduxStore
		.dispatch( requestSites() )
		.then( () => fetchSitesUntilSiteAppears( siteSlug, reduxStore, callback ) );
}

export function fetchSitesAndUser( siteSlug, onComplete, reduxStore ) {
	Promise.all( [
		promisify( fetchSitesUntilSiteAppears )( siteSlug, reduxStore ),
		new Promise( resolve => {
			user.once( 'change', resolve );
			user.fetch();
		} ),
	] ).then( onComplete );
}

export function setThemeOnSite( callback, { siteSlug, themeSlugWithRepo } ) {
	if ( isEmpty( themeSlugWithRepo ) ) {
		defer( callback );

		return;
	}

	wpcom
		.undocumented()
		.changeTheme( siteSlug, { theme: themeSlugWithRepo.split( '/' )[ 1 ] }, function( errors ) {
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
export function getUsernameSuggestion( username, reduxState ) {
	const fields = {
		givesuggestions: 1,
		username: username,
	};

	// Clear out the local storage variable before sending the call.
	reduxState.dispatch( {
		type: SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET,
		data: '',
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
			data: resultingUsername,
		} );
	} );
}

export function addPlanToCart( callback, { siteId }, { cartItem, privacyItem } ) {
	if ( isEmpty( cartItem ) ) {
		// the user selected the free plan
		defer( callback );

		return;
	}

	const newCartItems = [ cartItem, privacyItem ].filter( item => item );

	SignupCart.addToCart( siteId, newCartItems, error =>
		callback( error, { cartItem, privacyItem } )
	);
}

export function createAccount(
	callback,
	dependencies,
	{ userData, flowName, queryArgs, service, access_token, id_token, oauth2Signup },
	reduxStore
) {
	const surveyVertical = getSurveyVertical( reduxStore.getState() ).trim();
	const surveySiteType = getSurveySiteType( reduxStore.getState() ).trim();
	const userExperience = getUserExperience( reduxStore.getState() );

	if ( service ) {
		// We're creating a new social account
		wpcom.undocumented().usersSocialNew(
			{
				service,
				access_token,
				id_token,
				signup_flow_name: flowName,
			},
			( error, response ) => {
				const errors =
					error && error.error
						? [ { error: error.error, message: error.message, email: get( error, 'data.email' ) } ]
						: undefined;

				if ( errors ) {
					callback( errors );
				} else {
					analytics.tracks.recordEvent( 'calypso_user_registration_social_complete' );
					callback( undefined, pick( response, [ 'username', 'bearer_token' ] ) );
				}
			}
		);
	} else {
		wpcom.undocumented().usersNew(
			assign(
				{},
				userData,
				{
					ab_test_variations: getSavedVariations(),
					validate: false,
					signup_flow_name: flowName,
					nux_q_site_type: surveySiteType,
					nux_q_question_primary: surveyVertical,
					nux_q_question_experience: userExperience || undefined,
					// url sent in the confirmation email
					jetpack_redirect: queryArgs.jetpack_redirect,
				},
				oauth2Signup
					? {
							oauth2_client_id: queryArgs.oauth2_client_id,
							// url of the WordPress.com authorize page for this OAuth2 client
							// convert to legacy oauth2_redirect format: %s@https://public-api.wordpress.com/oauth2/authorize/...
							oauth2_redirect: queryArgs.oauth2_redirect && '0@' + queryArgs.oauth2_redirect,
					  }
					: null
			),
			( error, response ) => {
				const errors =
						error && error.error ? [ { error: error.error, message: error.message } ] : undefined,
					bearerToken = error && error.error ? {} : { bearer_token: response.bearer_token };

				if ( ! errors ) {
					// Fire after a new user registers.
					analytics.tracks.recordEvent( 'calypso_user_registration_complete' );
					analytics.ga.recordEvent( 'Signup', 'calypso_user_registration_complete' );
				}

				const providedDependencies = assign( {}, { username: userData.username }, bearerToken );

				if ( oauth2Signup ) {
					assign( providedDependencies, {
						oauth2_client_id: queryArgs.oauth2_client_id,
						oauth2_redirect: queryArgs.oauth2_redirect,
					} );
				}

				callback( errors, providedDependencies );
			}
		);
	}
}

export function createSite( callback, { themeSlugWithRepo }, { site }, reduxStore ) {
	const data = {
		blog_name: site,
		blog_title: '',
		options: { theme: themeSlugWithRepo },
		validate: false,
	};

	wpcom.undocumented().sitesNew( data, function( errors, response ) {
		let providedDependencies, siteSlug;

		if ( response && response.blog_details ) {
			const parsedBlogURL = parseURL( response.blog_details.url );
			siteSlug = parsedBlogURL.hostname;

			providedDependencies = { siteSlug };
		}

		if ( user.get() && isEmpty( errors ) ) {
			fetchSitesAndUser( siteSlug, () => callback( undefined, providedDependencies ), reduxStore );
		} else {
			callback( isEmpty( errors ) ? undefined : [ errors ], providedDependencies );
		}
	} );
}

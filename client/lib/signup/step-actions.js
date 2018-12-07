/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { assign, defer, get, isEmpty, isNull, omitBy, pick, startsWith } from 'lodash';
import { parse as parseURL } from 'url';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
/* eslint-enable no-restricted-imports */
import userFactory from 'lib/user';
const user = userFactory();
import { getABTestVariation, getSavedVariations, abtest } from 'lib/abtest';
import SignupCart from 'lib/signup/cart';
import analytics from 'lib/analytics';
import { SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET } from 'state/action-types';
import { cartItems } from 'lib/cart-values';
import { isDomainTransfer } from 'lib/products-values';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSurveyVertical, getSurveySiteType } from 'state/signup/steps/survey/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getSiteVerticalId, getSiteVerticalName } from 'state/signup/steps/site-vertical/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import getSiteId from 'state/selectors/get-site-id';
import { getSiteGoals } from 'state/signup/steps/site-goals/selectors';
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { getUserExperience } from 'state/signup/steps/user-experience/selectors';
import { requestSites } from 'state/sites/actions';
import { supportsPrivacyProtectionPurchase } from 'lib/cart-values/cart-items';
import { getProductsList } from 'state/products-list/selectors';
import { getSelectedImportEngine, getNuxUrlInputValue } from 'state/importer-nux/temp-selectors';
import { normalizeImportUrl } from 'state/importer-nux/utils';
import { promisify } from '../../utils';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';

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

// We are experimenting making site topic (site vertical name) a separate step from the survey.
// Once we've decided to fully move away from the survey form, we can just keep the site vertical name here.
function getSiteVertical( state ) {
	return ( getSiteVerticalName( state ) || getSurveyVertical( state ) ).trim();
}

export function createSiteWithCart(
	callback,
	dependencies,
	{
		cartItem,
		domainItem,
		flowName,
		googleAppsCartItem,
		isPurchasingItem,
		siteUrl,
		themeSlugWithRepo,
		themeItem,
	},
	reduxStore
) {
	const state = reduxStore.getState();

	const designType = getDesignType( state ).trim();
	const siteTitle = getSiteTitle( state ).trim();
	const siteVerticalId = getSiteVerticalId( state );
	const siteVertical = getSiteVertical( state );
	const siteGoals = getSiteGoals( state ).trim();
	const siteType = getSiteType( state ).trim();
	const siteStyle = getSiteStyle( state ).trim();
	const siteInformation = getSiteInformation( state );

	const newSiteParams = {
		blog_title: siteTitle,
		options: {
			designType: designType || undefined,
			// the theme can be provided in this step's dependencies or the
			// step object itself depending on if the theme is provided in a
			// query. See `getThemeSlug` in `DomainsStep`.
			theme: dependencies.themeSlugWithRepo || themeSlugWithRepo,
			siteGoals: siteGoals || undefined,
			site_style: siteStyle || undefined,
			site_information: siteInformation || undefined,
			site_segment: getSiteTypePropertyValue( 'slug', siteType, 'id' ) || undefined,
			site_vertical: siteVerticalId || undefined,
		},
		validate: false,
	};

	const importingFromUrl =
		'import' === flowName ? normalizeImportUrl( getNuxUrlInputValue( state ) ) : '';

	if ( importingFromUrl ) {
		newSiteParams.blog_name = importingFromUrl;
		newSiteParams.find_available_url = true;
		newSiteParams.public = -1;
	} else if (
		flowName === 'onboarding' &&
		'remove' === getABTestVariation( 'removeDomainsStepFromOnboarding' )
	) {
		newSiteParams.blog_name = get( user.get(), 'username', siteTitle ) || siteType || siteVertical;
		newSiteParams.find_available_url = true;
		newSiteParams.public = 1;
	} else {
		newSiteParams.blog_name = siteUrl;
		newSiteParams.find_available_url = !! isPurchasingItem;
		newSiteParams.public = abtest( 'privateByDefault' ) === 'private' ? -1 : 1;
	}

	wpcom.undocumented().sitesNew( newSiteParams, function( error, response ) {
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
				const productsList = getProductsList( state );
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
	} );
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

export function addPlanToCart( callback, { siteSlug }, { cartItem } ) {
	if ( isEmpty( cartItem ) ) {
		// the user selected the free plan
		defer( callback );

		return;
	}

	const newCartItems = [ cartItem ].filter( item => item );

	SignupCart.addToCart( siteSlug, newCartItems, error => callback( error, { cartItem } ) );
}

export function createAccount(
	callback,
	dependencies,
	{ userData, flowName, queryArgs, service, access_token, id_token, oauth2Signup },
	reduxStore
) {
	const state = reduxStore.getState();

	const siteVertical = getSiteVertical( state );
	const surveySiteType = getSurveySiteType( state ).trim();
	const userExperience = getUserExperience( state );
	const importEngine = 'import' === flowName ? getSelectedImportEngine( state ) : '';
	const importFromSite = 'import' === flowName ? getNuxUrlInputValue( state ) : '';

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
					nux_q_question_primary: siteVertical,
					nux_q_question_experience: userExperience || undefined,
					import_engine: importEngine,
					import_from_site: importFromSite,
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
					analytics.recordRegistration();
				}

				const username =
					( response && response.signup_sandbox_username ) ||
					( response && response.username ) ||
					userData.username;
				const providedDependencies = assign( {}, { username }, bearerToken );

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
		public: -1,
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

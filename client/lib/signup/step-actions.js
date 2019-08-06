/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { assign, defer, difference, get, isEmpty, isNull, omitBy, pick, startsWith } from 'lodash';
import { parse as parseURL } from 'url';

/**
 * Internal dependencies
 */

// Libraries
import wpcom from 'lib/wp';
/* eslint-enable no-restricted-imports */
import userFactory from 'lib/user';
import { getSavedVariations } from 'lib/abtest';
import analytics from 'lib/analytics';
import {
	updatePrivacyForDomain,
	supportsPrivacyProtectionPurchase,
	planItem as getCartItemForPlan,
} from 'lib/cart-values/cart-items';

// State actions and selectors
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSurveyVertical, getSurveySiteType } from 'state/signup/steps/survey/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getSiteVerticalId, getSiteVerticalName } from 'state/signup/steps/site-vertical/selectors';
import getSiteId from 'state/selectors/get-site-id';
import { getSiteGoals } from 'state/signup/steps/site-goals/selectors';
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { getUserExperience } from 'state/signup/steps/user-experience/selectors';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { requestSites } from 'state/sites/actions';
import { getProductsList } from 'state/products-list/selectors';
import { getSelectedImportEngine, getNuxUrlInputValue } from 'state/importer-nux/temp-selectors';

// Current directory dependencies
import { isValidLandingPageVertical } from './verticals';
import { getSiteTypePropertyValue } from './site-type';
import SignupCart from './cart';
import { promisify } from '../../utils';

// Others
import flows from 'signup/config/flows';
import steps, { isDomainStepSkippable } from 'signup/config/steps';
import { normalizeImportUrl } from 'state/importer-nux/utils';
import { isEligibleForPageBuilder, shouldEnterPageBuilder } from 'lib/signup/page-builder';

/**
 * Constants
 */
const user = userFactory();
const debug = debugFactory( 'calypso:signup:step-actions' );

export function createSiteOrDomain( callback, dependencies, data, reduxStore ) {
	const { siteId, siteSlug } = data;
	const { cartItem, designType, siteUrl, themeSlugWithRepo } = dependencies;
	let { domainItem } = dependencies;

	if ( designType === 'domain' ) {
		const cartKey = 'no-site';
		const providedDependencies = {
			siteId: null,
			siteSlug: cartKey,
			themeSlugWithRepo: null,
			domainItem,
		};

		if ( domainItem ) {
			const { product_slug: productSlug } = domainItem;
			const productsList = getProductsList( reduxStore.getState() );
			if ( supportsPrivacyProtectionPurchase( productSlug, productsList ) ) {
				domainItem = updatePrivacyForDomain( domainItem, true );
			}
		}

		const domainChoiceCart = [ domainItem ];
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
		lastKnownFlow,
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
	const siteGoals = getSiteGoals( state ).trim();
	const siteType = getSiteType( state ).trim();
	const siteStyle = getSiteStyle( state ).trim();
	const siteSegment = getSiteTypePropertyValue( 'slug', siteType, 'id' );

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
			site_segment: siteSegment || undefined,
			site_vertical: siteVerticalId || undefined,
			site_information: {
				title: siteTitle,
			},
		},
		public: 1,
		validate: false,
	};

	// flowName isn't always passed in
	const flowToCheck = flowName || lastKnownFlow;

	if ( 'import' === lastKnownFlow || 'import-onboarding' === lastKnownFlow ) {
		const importingFromUrl = getNuxUrlInputValue( state );
		newSiteParams.blog_name = normalizeImportUrl( importingFromUrl );
		newSiteParams.find_available_url = true;
		newSiteParams.options.nux_import_engine = getSelectedImportEngine( state );
		newSiteParams.options.nux_import_from_url = importingFromUrl;
	} else if ( ! siteUrl && isDomainStepSkippable( flowToCheck ) ) {
		newSiteParams.blog_name =
			get( user.get(), 'username' ) ||
			get( getSignupDependencyStore( state ), 'username' ) ||
			siteTitle ||
			siteType ||
			getSiteVertical( state );
		newSiteParams.find_available_url = true;
	} else {
		newSiteParams.blog_name = siteUrl;
		newSiteParams.find_available_url = !! isPurchasingItem;
	}

	if ( isEligibleForPageBuilder( siteSegment, flowToCheck ) && shouldEnterPageBuilder() ) {
		newSiteParams.options.in_page_builder = true;
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

		const newCartItems = [ cartItem, domainItem, googleAppsCartItem, themeItem ].filter(
			item => item
		);

		processItemCart(
			providedDependencies,
			newCartItems,
			callback,
			reduxStore,
			siteSlug,
			isFreeThemePreselected,
			themeSlugWithRepo
		);
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

export function addPlanToCart( callback, dependencies, stepProvidedItems, reduxStore ) {
	const { siteSlug } = dependencies;
	const { cartItem } = stepProvidedItems;
	if ( isEmpty( cartItem ) ) {
		// the user selected the free plan
		defer( callback );

		return;
	}

	const providedDependencies = { cartItem };

	const newCartItems = [ cartItem ].filter( item => item );

	processItemCart( providedDependencies, newCartItems, callback, reduxStore, siteSlug, null, null );
}

export function addDomainToCart( callback, dependencies, stepProvidedItems, reduxStore ) {
	const { siteSlug } = dependencies;
	const { domainItem, googleAppsCartItem } = stepProvidedItems;
	const providedDependencies = { domainItem };

	const newCartItems = [ domainItem, googleAppsCartItem ].filter( item => item );

	processItemCart( providedDependencies, newCartItems, callback, reduxStore, siteSlug, null, null );
}

function processItemCart(
	providedDependencies,
	newCartItems,
	callback,
	reduxStore,
	siteSlug,
	isFreeThemePreselected,
	themeSlugWithRepo
) {
	const addToCartAndProceed = () => {
		let privacyItem = null;
		const state = reduxStore.getState();
		const { domainItem } = newCartItems;

		if ( domainItem ) {
			const { product_slug: productSlug } = domainItem;
			const productsList = getProductsList( state );
			if ( supportsPrivacyProtectionPurchase( productSlug, productsList ) ) {
				privacyItem = updatePrivacyForDomain( domainItem, true );

				if ( privacyItem ) {
					newCartItems.push( privacyItem );
				}
			}
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

export function launchSiteApi( callback, dependencies ) {
	const { siteSlug } = dependencies;

	wpcom.undocumented().launchSite( siteSlug, function( error ) {
		if ( error ) {
			callback( error );

			return;
		}

		callback();
	} );
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
					return;
				}

				if ( ! response || ! response.bearer_token ) {
					// something odd happened...
					//eslint-disable-next-line no-console
					console.error(
						'Expected either an error or a bearer token. got %o, %o.',
						error,
						response
					);
				}

				analytics.recordSocialRegistration();

				callback( undefined, pick( response, [ 'username', 'bearer_token' ] ) );
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
					error && error.error ? [ { error: error.error, message: error.message } ] : undefined;

				if ( errors ) {
					callback( errors );
					return;
				}

				// we should either have an error with an error property, or we should have a response with a bearer_token
				const bearerToken = {};
				if ( response && response.bearer_token ) {
					bearerToken.bearer_token = response.bearer_token;
				} else {
					// something odd happened...
					//eslint-disable-next-line no-console
					console.error(
						'Expected either an error or a bearer token. got %o, %o.',
						error,
						response
					);
				}

				const username =
					( response && response.signup_sandbox_username ) ||
					( response && response.username ) ||
					userData.username;

				const userId =
					( response && response.signup_sandbox_user_id ) ||
					( response && response.user_id ) ||
					userData.ID;

				// Fire after a new user registers.
				analytics.recordRegistration( { flow: flowName } );
				analytics.identifyUser( username, userId );

				const providedDependencies = assign( { username }, bearerToken );

				if ( oauth2Signup ) {
					assign( providedDependencies, {
						oauth2_client_id: queryArgs.oauth2_client_id,
						oauth2_redirect: get( response, 'oauth2_redirect', '' ).split( '@' )[ 1 ],
					} );
				}

				callback( undefined, providedDependencies );
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

function recordExcludeStepEvent( step, value ) {
	analytics.tracks.recordEvent( 'calypso_signup_actions_exclude_step', {
		step,
		value,
	} );
}

function shouldExcludeStep( stepName, fulfilledDependencies ) {
	if ( isEmpty( fulfilledDependencies ) ) {
		return false;
	}

	const stepProvidesDependencies = steps[ stepName ].providesDependencies;
	const dependenciesNotProvided = difference( stepProvidesDependencies, fulfilledDependencies );
	return isEmpty( dependenciesNotProvided );
}

export function isDomainFulfilled( stepName, defaultDependencies, nextProps ) {
	const { siteDomains, submitSignupStep } = nextProps;
	let fulfilledDependencies = [];

	if ( siteDomains && siteDomains.length > 1 ) {
		const domainItem = undefined;
		submitSignupStep( { stepName, domainItem }, { domainItem } );
		recordExcludeStepEvent(
			stepName,
			siteDomains.map( siteDomain => siteDomain.domain ).join( ', ' )
		);

		fulfilledDependencies = [ 'domainItem' ];
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

export function isPlanFulfilled( stepName, defaultDependencies, nextProps ) {
	const { isPaidPlan, sitePlanSlug, submitSignupStep } = nextProps;
	let fulfilledDependencies = [];

	if ( isPaidPlan ) {
		const cartItem = undefined;
		submitSignupStep( { stepName, cartItem }, { cartItem } );
		recordExcludeStepEvent( stepName, sitePlanSlug );
		fulfilledDependencies = [ 'cartItem' ];
	} else if ( defaultDependencies && defaultDependencies.cartItem ) {
		const cartItem = getCartItemForPlan( defaultDependencies.cartItem );
		submitSignupStep( { stepName, cartItem }, { cartItem } );
		recordExcludeStepEvent( stepName, defaultDependencies.cartItem );
		fulfilledDependencies = [ 'cartItem' ];
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

export function isSiteTypeFulfilled( stepName, defaultDependencies, nextProps ) {
	if ( isEmpty( nextProps.initialContext && nextProps.initialContext.query ) ) {
		return;
	}

	const {
		initialContext: {
			query: { site_type: siteType },
		},
	} = nextProps;

	const siteTypeValue = getSiteTypePropertyValue( 'slug', siteType, 'slug' );
	let fulfilledDependencies = [];

	if ( siteTypeValue ) {
		debug( 'From query string: site_type = %s', siteType );
		debug( 'Site type value = %s', siteTypeValue );

		nextProps.submitSiteType( siteType );
		recordExcludeStepEvent( stepName, siteType );

		// nextProps.submitSiteType( siteType ) above provides dependencies
		fulfilledDependencies = fulfilledDependencies.concat( [ 'siteType', 'themeSlugWithRepo' ] );
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

export function isSiteTopicFulfilled( stepName, defaultDependencies, nextProps ) {
	if ( isEmpty( nextProps.initialContext && nextProps.initialContext.query ) ) {
		return;
	}

	const {
		initialContext: {
			query: { vertical },
		},
		flowName,
	} = nextProps;

	const flowSteps = flows.getFlow( flowName ).steps;
	let fulfilledDependencies = [];

	if ( vertical && -1 === flowSteps.indexOf( 'survey' ) ) {
		debug( 'From query string: vertical = %s', vertical );

		nextProps.setSurvey( { vertical, otherText: '' } );

		nextProps.submitSignupStep(
			{ stepName: 'survey' },
			{ surveySiteType: 'blog', surveyQuestion: vertical }
		);

		nextProps.submitSiteVertical( { name: vertical }, stepName );

		// Track our landing page verticals
		if ( isValidLandingPageVertical( vertical ) ) {
			analytics.tracks.recordEvent( 'calypso_signup_vertical_landing_page', {
				vertical,
				flow: flowName,
			} );
		}

		//Add to fulfilled dependencies
		fulfilledDependencies = fulfilledDependencies.concat( [
			'surveySiteType',
			'surveyQuestion',
			'siteTopic',
		] );

		recordExcludeStepEvent( stepName, vertical );
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

/**
 * Creates a user account and sends the user a verification code via email to confirm the account.
 * Returns the dependencies for the step.
 *
 * @param {function} callback Callback function
 * @param {object}   data     POST data object
 */
export function createPasswordlessUser( callback, { email } ) {
	wpcom
		.undocumented()
		.usersEmailNew( { email }, null )
		.then( response => callback( null, response ) )
		.catch( err => callback( err ) );
}

/**
 * Verifies a passwordless user code.
 *
 * @param {function} callback Callback function
 * @param {object}   data     POST data object
 */
export async function verifyPasswordlessUser( callback, { email, code } ) {
	wpcom
		.undocumented()
		.usersEmailVerification( { email, code }, null )
		.then( response =>
			callback( null, { email, username: email, bearer_token: response.token.access_token } )
		)
		.catch( err => callback( err ) );
}

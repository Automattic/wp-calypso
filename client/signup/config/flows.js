/** @format */

/**
 * External dependencies
 */

import { assign, includes, reject } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import stepConfig from './steps';
import userFactory from 'lib/user';
const user = userFactory();

function getCheckoutUrl( dependencies ) {
	return '/checkout/' + dependencies.siteSlug;
}

function dependenciesContainCartItem( dependencies ) {
	return dependencies.cartItem || dependencies.domainItem || dependencies.themeItem;
}

function getSiteDestination( dependencies ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies );
	}

	let protocol = 'https';

	/**
	 * It is possible that non-wordpress.com sites are not HTTPS ready.
	 *
	 * Redirect them
	 */
	if ( ! dependencies.siteSlug.match( /wordpress\.[a-z]+$/i ) ) {
		protocol = 'http';
	}

	return protocol + '://' + dependencies.siteSlug;
}

function getPostsDestination( dependencies ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies );
	}

	return '/posts/' + dependencies.siteSlug;
}

const flows = {
	account: {
		steps: [ 'user' ],
		destination: '/',
		description: 'Create an account without a blog.',
		lastModified: '2015-07-07',
	},

	business: {
		steps: [ 'about', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/business/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the business plan to the users cart.',
		lastModified: '2018-01-24',
		meta: {
			skipBundlingPlan: true,
		},
	},

	premium: {
		steps: [ 'about', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/premium/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the premium plan to the users cart.',
		lastModified: '2018-01-24',
		meta: {
			skipBundlingPlan: true,
		},
	},

	personal: {
		steps: [ 'about', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/personal/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the personal plan to the users cart.',
		lastModified: '2018-01-24',
	},

	free: {
		steps: [ 'about', 'themes', 'domains', 'user' ],
		destination: getSiteDestination,
		description: 'Create an account and a blog and default to the free plan.',
		lastModified: '2018-01-24',
	},

	blog: {
		steps: [ 'blog-themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow starting with blog themes',
		lastModified: '2017-09-01',
	},

	website: {
		steps: [ 'website-themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow starting with website themes',
		lastModified: '2017-09-01',
	},

	portfolio: {
		steps: [ 'portfolio-themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow starting with portfolio themes',
		lastModified: '2017-09-01',
	},

	store: {
		steps: [ 'about', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow for creating an online store',
		lastModified: '2018-01-24',
	},

	'rebrand-cities': {
		steps: [ 'rebrand-cities-welcome', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/business/' + dependencies.siteSlug;
		},
		description: 'Create an account for REBRAND cities partnership',
		lastModified: '2017-07-01',
		meta: {
			skipBundlingPlan: true,
		},
	},

	'with-theme': {
		steps: [ 'domains-theme-preselected', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Preselect a theme to activate/buy from an external source',
		lastModified: '2016-01-27',
	},

	'creative-mornings': {
		steps: [ 'portfolio-themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow for creative mornings partnership',
		lastModified: '2017-08-01',
	},

	subdomain: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Provide a vertical for subdomains',
		lastModified: '2016-10-31',
	},

	main: {
		steps: [ 'about', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2018-01-24',
	},

	surveystep: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2016-05-23',
	},

	'test-site': {
		steps: process.env.NODE_ENV === 'development' ? [ 'site', 'user' ] : [ 'user' ],
		destination: '/',
		description: 'This flow is used to test the site step.',
		lastModified: '2015-09-22',
	},

	'delta-discover': {
		steps: [ 'user' ],
		destination: '/',
		description:
			'A copy of the `account` flow for the Delta email campaigns. Half of users who ' +
			'go through this flow receive a reader-specific drip email series.',
		lastModified: '2016-05-03',
	},

	'delta-blog': {
		steps: [ 'about', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description:
			'A copy of the `blog` flow for the Delta email campaigns. Half of users who go ' +
			'through this flow receive a blogging-specific drip email series.',
		lastModified: '2018-01-24',
	},

	'delta-site': {
		steps: [ 'about', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description:
			'A copy of the `website` flow for the Delta email campaigns. Half of users who go ' +
			'through this flow receive a website-specific drip email series.',
		lastModified: '2018-01-24',
	},

	desktop: {
		steps: [ 'about', 'themes', 'domains', 'plans', 'user' ],
		destination: getPostsDestination,
		description: 'Signup flow for desktop app',
		lastModified: '2018-01-24',
	},

	developer: {
		steps: [ 'site', 'user' ],
		destination: '/devdocs/welcome',
		description: 'Signup flow for developers in developer environment',
		lastModified: '2015-11-23',
	},

	pressable: {
		steps: [ 'design-type-with-store', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow for testing the pressable-store step',
		lastModified: '2016-06-27',
	},

	jetpack: {
		steps: [ 'jetpack-user' ],
		destination: '/',
	},

	'get-dot-blog': {
		steps: [ 'get-dot-blog-themes', 'get-dot-blog-plans' ],
		destination: getSiteDestination,
		description: 'Used by `get.blog` users that connect their site to WordPress.com',
		lastModified: '2016-11-14',
	},

	'pressable-nux': {
		steps: [ 'creds-permission', 'creds-confirm', 'creds-complete' ],
		destination: () => {
			return '/stats';
		},
		description: 'Allow new Pressable users to grant permission to server credentials',
		lastModified: '2017-11-20',
		disallowResume: true,
		allowContinue: false,
		hideFlowProgress: true,
	},

	'rewind-switch': {
		steps: [ 'rewind-migrate', 'rewind-were-backing' ],
		destination: () => {
			return '/stats/activity';
		},
		description:
			'Allows users with Jetpack plan with VaultPress credentials to migrate credentials',
		lastModified: '2018-01-27',
		disallowResume: true,
		allowContinue: false,
		hideFlowProgress: true,
	},

	'rewind-setup': {
		steps: [ 'rewind-add-creds', 'rewind-form-creds', 'rewind-were-backing' ],
		destination: () => {
			return '/stats/activity';
		},
		description: 'Allows users with Jetpack plan to setup credentials',
		lastModified: '2018-01-27',
		disallowResume: true,
		allowContinue: false,
		hideFlowProgress: true,
	},

	'rewind-auto-config': {
		steps: [ 'creds-permission', 'creds-confirm', 'rewind-were-backing' ],
		destination: () => {
			return '/stats/activity';
		},
		description:
			'Allow users of sites that can auto-config to grant permission to server credentials',
		lastModified: '2018-02-13',
		disallowResume: true,
		allowContinue: false,
		hideFlowProgress: true,
	},
};

if ( config.isEnabled( 'signup/atomic-store-flow' ) ) {
	flows[ 'store-nux' ] = {
		steps: [ 'about', 'themes', 'domains', 'plans-store-nux', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow for creating an online store with an Atomic site',
		lastModified: '2018-01-24',
	};
}

if ( config.isEnabled( 'signup/wpcc' ) ) {
	flows.wpcc = {
		steps: [ 'oauth2-user' ],
		destination: function( dependencies ) {
			return dependencies.oauth2_redirect || '/';
		},
		description: 'WordPress.com Connect signup flow',
		lastModified: '2017-08-24',
		disallowResume: true, // don't allow resume so we don't clear query params when we go back in the history
		autoContinue: true,
	};
}

if ( config.isEnabled( 'signup/domain-first-flow' ) ) {
	flows[ 'domain-first' ] = {
		steps: [ 'site-or-domain', 'site-picker', 'themes', 'plans-site-selected', 'user' ],
		destination: getSiteDestination,
		description: 'An experimental approach for WordPress.com/domains',
		disallowResume: true,
		lastModified: '2017-05-09',
	};

	flows[ 'site-selected' ] = {
		steps: [ 'themes-site-selected', 'plans-site-selected' ],
		destination: getSiteDestination,
		providesDependenciesInQuery: [ 'siteSlug', 'siteId' ],
		description: 'A flow to test updating an existing site with `Signup`',
		lastModified: '2017-01-19',
	};
}

if ( process.env.NODE_ENV === 'development' ) {
	flows[ 'test-plans' ] = {
		steps: [ 'site', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'This flow is used to test plans choice in signup',
		lastModified: '2016-06-30',
	};
}

function removeUserStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return assign( {}, flow, {
		steps: reject( flow.steps, stepName => stepConfig[ stepName ].providesToken ),
	} );
}

function replaceStepInFlow( flow, oldStepName, newStepName ) {
	// no change
	if ( ! includes( flow.steps, oldStepName ) ) {
		return flow;
	}

	return assign( {}, flow, {
		steps: flow.steps.map( stepName => ( stepName === oldStepName ? newStepName : stepName ) ),
	} );
}

function filterDesignTypeInFlow( flowName, flow ) {
	if ( ! flow ) {
		return;
	}

	if ( config.isEnabled( 'signup/atomic-store-flow' ) ) {
		// If Atomic Store is enabled, replace 'design-type-with-store' with
		// 'design-type-with-store-nux' in flows other than 'pressable'.
		if ( flowName !== 'pressable' && includes( flow.steps, 'design-type-with-store' ) ) {
			return replaceStepInFlow( flow, 'design-type-with-store', 'design-type-with-store-nux' );
		}

		// Show store option to everyone if Atomic Store is enabled
		return replaceStepInFlow( flow, 'design-type', 'design-type-with-store-nux' );
	}

	// Show design type with store option only to new users with EN locale
	if ( ! user.get() && 'en' === i18n.getLocaleSlug() ) {
		return replaceStepInFlow( flow, 'design-type', 'design-type-with-store' );
	}

	return flow;
}

/**
 * Properly filter the current flow.
 *
 * Called by `getFlowName` in 'signup/utils.js' to allow conditional filtering of the current
 * flow for AB tests.
 *
 * @example
 * function filterFlowName( flowName ) {
 *   const defaultFlows = [ 'main', 'website' ];
 *   if ( ! user.get() && includes( defaultFlows, flowName ) ) {
 *     return 'filtered-flow-name';
 *   }
 *   return flowName;
 * }
 * // If user is logged out and the current flow is 'main' or 'website' switch to 'filtered-flow-name' flow.
 *
 * @param  {string} flowName Current flow name.
 * @return {string}          New flow name.
 */
function filterFlowName( flowName ) {
	// do nothing. No flows to filter at the moment.
	return flowName;
}

function filterDestination( destination ) {
	return destination;
}

const Flows = {
	filterFlowName,
	filterDestination,

	defaultFlowName: 'main',
	resumingFlow: false,

	/**
	 * Get certain flow from the flows configuration.
	 *
	 * The returned flow is modified according to several filters.
	 *
	 * `currentStepName` is the current step in the signup flow. It is used
	 * to determine if any AB variations should be assigned after it is completed.
	 * Example use case: To determine if a new signup step should be part of the flow or not.
	 *
	 * @param {String} flowName The name of the flow to return
	 * @param {String} currentStepName The current step. See description above
	 * @returns {Object} A flow object
	 */
	getFlow( flowName, currentStepName = '' ) {
		let flow = Flows.getFlows()[ flowName ];

		// if the flow couldn't be found, return early
		if ( ! flow ) {
			return flow;
		}

		if ( user.get() ) {
			flow = removeUserStepFromFlow( flow );
		}

		// Maybe modify the design type step to a variant with store
		flow = filterDesignTypeInFlow( flowName, flow );

		Flows.preloadABTestVariationsForStep( flowName, currentStepName );

		return Flows.getABTestFilteredFlow( flowName, flow );
	},

	getFlows() {
		return flows;
	},

	isValidFlow( flowName ) {
		return Boolean( Flows.getFlows()[ flowName ] );
	},

	/**
	 * Preload AB Test variations after a certain step has been completed.
	 *
	 * This gives the option to set the AB variation as late as possible in the
	 * signup flow.
	 *
	 * Currently only the `main` flow is whitelisted.
	 *
	 * @param {String} flowName The current flow
	 * @param {String} stepName The step that is being completed right now
	 */
	preloadABTestVariationsForStep() {
		/**
		 * In cases where the flow is being resumed, the flow must not be changed from what the user
		 * has seen before.
		 *
		 * E.g. A user is resuming signup from before the test was added. There is no need
		 * to add a step somewhere back in the line.
		 */
		if ( Flows.resumingFlow ) {
			return;
		}

		/**
		 * If there is need to test the first step in a flow,
		 * the best way to do it is to check for:
		 *
		 * 	if ( 'main' === flowName && '' === stepName ) { ... }
		 *
		 * This will be fired at the beginning of the signup flow.
		 */
	},

	/**
	 * Return a flow that is modified according to the ABTest rules.
	 *
	 * Useful when testing new steps in the signup flows.
	 *
	 * Example usage: Inject or remove a step in the flow if a user is part of an ABTest.
	 *
	 * @param {String} flowName The current flow name
	 * @param {Object} flow The flow object
	 *
	 * @return {Object} A filtered flow object
	 */
	getABTestFilteredFlow( flowName, flow ) {
		// Only do this on the main flow
		// if ( 'main' === flowName ) {
		// }

		return flow;
	},

	/**
	 * Insert a step into the flow.
	 *
	 * @param {String} stepName The step to insert into the flow
	 * @param {Object} flow The flow that the step will be inserted into
	 * @param {String} afterStep After which step to insert the new step.
	 * 							 If left blank, the step will be added in the beginning.
	 *
	 * @returns {Object} A flow object with inserted step
	 */
	insertStepIntoFlow( stepName, flow, afterStep = '' ) {
		if ( -1 === flow.steps.indexOf( stepName ) ) {
			const steps = flow.steps.slice();
			const afterStepIndex = steps.indexOf( afterStep );

			/**
			 * Only insert the step if
			 * `afterStep` is empty ( insert at start )
			 * or if `afterStep` is found in the flow. ( insert after `afterStep` )
			 */
			if ( afterStepIndex > -1 || '' === afterStep ) {
				steps.splice( afterStepIndex + 1, 0, stepName );

				return {
					...flow,
					steps,
				};
			}
		}

		return flow;
	},

	removeStepFromFlow( stepName, flow ) {
		return {
			...flow,
			steps: flow.steps.filter( step => {
				return step !== stepName;
			} ),
		};
	},
};

export default Flows;

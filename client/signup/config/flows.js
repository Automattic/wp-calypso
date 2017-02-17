/**
 * External dependencies
 */
import { assign, includes, reject } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { abtest, getABTestVariation } from 'lib/abtest';
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
	if ( ! dependencies.siteSlug.match(/wordpress\.[a-z]+$/i) ) {
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
		lastModified: '2015-07-07'
	},

	business: {
		steps: [ 'design-type', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/business/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the business plan to the users cart.',
		lastModified: '2016-06-02',
		meta: {
			skipBundlingPlan: true
		}
	},

	premium: {
		steps: [ 'design-type', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/premium/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the premium plan to the users cart.',
		lastModified: '2016-06-02',
		meta: {
			skipBundlingPlan: true
		}
	},

	free: {
		steps: [ 'design-type', 'themes', 'domains', 'user' ],
		destination: getSiteDestination,
		description: 'Create an account and a blog and default to the free plan.',
		lastModified: '2016-06-02'
	},

	'with-theme': {
		steps: [ 'domains-theme-preselected', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Preselect a theme to activate/buy from an external source',
		lastModified: '2016-01-27'
	},

	subdomain: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Provide a vertical for subdomains',
		lastModified: '2016-10-31'
	},

	main: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2016-05-23'
	},

	surveystep: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2016-05-23'
	},

	sitetitle: {
		steps: [ 'site-title', 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2016-05-23'
	},

	website: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'This flow was originally used for the users who clicked "Create Website" on the two-button homepage. It is now linked to from the default homepage CTA as the main flow was slightly behind given translations.',
		lastModified: '2016-05-23'
	},

	blog: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'This flow was originally used for the users who clicked "Create Blog" on the two-button homepage. It is now used from blog-specific landing pages so that verbiage in survey steps refers to "blog" instead of "website".',
		lastModified: '2016-05-23'
	},

	personal: {
		steps: [ 'design-type', 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/personal/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the personal plan to the users cart.',
		lastModified: '2016-01-21'
	},

	'test-site': {
		steps: config( 'env' ) === 'development' ? [ 'site', 'user' ] : [ 'user' ],
		destination: '/',
		description: 'This flow is used to test the site step.',
		lastModified: '2015-09-22'
	},

	'delta-discover': {
		steps: [ 'user' ],
		destination: '/',
		description: 'A copy of the `account` flow for the Delta email campaigns. Half of users who go through this flow receive a reader-specific drip email series.',
		lastModified: '2016-05-03'
	},

	'delta-blog': {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'A copy of the `blog` flow for the Delta email campaigns. Half of users who go through this flow receive a blogging-specific drip email series.',
		lastModified: '2016-03-09'
	},

	'delta-site': {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'A copy of the `website` flow for the Delta email campaigns. Half of users who go through this flow receive a website-specific drip email series.',
		lastModified: '2016-03-09'
	},

	desktop: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getPostsDestination,
		description: 'Signup flow for desktop app',
		lastModified: '2016-05-30'
	},

	developer: {
		steps: [ 'themes', 'site', 'user' ],
		destination: '/devdocs/welcome',
		description: 'Signup flow for developers in developer environment',
		lastModified: '2015-11-23'
	},

	pressable: {
		steps: [ 'design-type-with-store', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Signup flow for testing the pressable-store step',
		lastModified: '2016-06-27'
	},

	jetpack: {
		steps: [ 'jetpack-user' ],
		destination: '/'
	},

	'get-dot-blog': {
		steps: [ 'get-dot-blog-themes', 'get-dot-blog-plans' ],
		destination: getSiteDestination,
		description: 'Used by `get.blog` users that connect their site to WordPress.com',
		lastModified: '2016-11-14'
	},

	'user-first': {
		steps: [ 'user', 'design-type', 'themes', 'domains', 'plans' ],
		destination: getSiteDestination,
		description: 'User-first signup flow',
		lastModified: '2016-01-18',
	},
};

if ( config.isEnabled( 'signup/domain-first-flow' ) ) {
	flows[ 'domain-first' ] = {
		steps: [ 'site-or-domain', 'themes', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'An experimental approach for WordPress.com/domains',
		lastModified: '2017-01-16'
	};

	flows[ 'site-selected' ] = {
		steps: [ 'themes-site-selected', 'plans-site-selected' ],
		destination: getSiteDestination,
		providesDependenciesInQuery: [ 'siteSlug', 'siteId' ],
		description: 'A flow to test updating an existing site with `Signup`',
		lastModified: '2017-01-19'
	};
}

if ( config( 'env' ) === 'development' ) {
	flows[ 'test-plans' ] = {
		steps: [ 'site', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'This flow is used to test plans choice in signup',
		lastModified: '2016-06-30'
	};
}

function removeUserStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return assign( {}, flow, {
		steps: reject( flow.steps, stepName => stepConfig[ stepName ].providesToken )
	} );
}

function filterDesignTypeInFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	if ( ! includes( flow.steps, 'design-type' ) || 'designTypeWithStore' !== abtest( 'signupStore' ) ) {
		return flow;
	}

	return assign( {}, flow, {
		steps: flow.steps.map( stepName => stepName === 'design-type' ? 'design-type-with-store' : stepName )
	} );
}

function filterFlowName( flowName ) {
	const defaultFlows = [ 'main', 'website' ];

	/**
	 * Only run the User First Signup for logged out users.
	 */
	if ( ! user.get() ) {
		if ( includes( defaultFlows, flowName ) && abtest( 'userFirstSignup' ) === 'userFirst' ) {
			return 'user-first';
		}
	}

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

		if ( ! user.get() && 'en' === i18n.getLocaleSlug() ) {
			flow = filterDesignTypeInFlow( flow );
		}

		Flows.preloadABTestVariationsForStep( flowName, currentStepName );

		return Flows.getABTestFilteredFlow( flowName, flow );
	},

	getFlows() {
		return flows;
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
	preloadABTestVariationsForStep( flowName, stepName ) {
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
		 * 	if ( '' === stepName ) { ... }
		 *
		 * This will be fired at the beginning of the signup flow.
		 */
		if ( 'main' === flowName ) {
			if ( '' === stepName ) {
				abtest( 'siteTitleStep' );
			}
		}
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
		if ( 'main' === flowName ) {
			if ( getABTestVariation( 'siteTitleStep' ) === 'showSiteTitleStep' ) {
				return Flows.insertStepIntoFlow( 'site-title', flow );
			}
		}

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
			steps: flow.steps.filter( ( step ) => {
				return step !== stepName;
			} )
		};
	}
};

export default Flows;

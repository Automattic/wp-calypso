/**
 * External dependencies
 */
import assign from 'lodash/assign';
import includes from 'lodash/includes';
import reject from 'lodash/reject';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import config from 'config';
import { isOutsideCalypso } from 'lib/url';
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

	return 'https://' + dependencies.siteSlug;
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
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'survey-user' ],
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
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'survey-user' ],
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
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'survey-user' ],
		destination: getSiteDestination,
		description: 'Create an account and a blog and default to the free plan.',
		lastModified: '2016-06-02'
	},

	'with-theme': {
		steps: [ 'domains-only', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Preselect a theme to activate/buy from an external source',
		lastModified: '2016-01-27'
	},

	main: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2016-05-23'
	},

	website: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'This flow was originally used for the users who clicked "Create Website" on the two-button homepage. It is now linked to from the default homepage CTA as the main flow was slightly behind given translations.',
		lastModified: '2016-05-23'
	},

	blog: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'This flow was originally used for the users who clicked "Create Blog" on the two-button homepage. It is now used from blog-specific landing pages so that verbiage in survey steps refers to "blog" instead of "website".',
		lastModified: '2016-05-23'
	},

	personal: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'user' ],
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
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'A copy of the `blog` flow for the Delta email campaigns. Half of users who go through this flow receive a blogging-specific drip email series.',
		lastModified: '2016-03-09'
	},

	'delta-site': {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'A copy of the `website` flow for the Delta email campaigns. Half of users who go through this flow receive a website-specific drip email series.',
		lastModified: '2016-03-09'
	},

	desktop: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'survey-user' ],
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
		steps: [ 'survey', 'design-type-with-store', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'Signup flow for testing the pressable-store step',
		lastModified: '2016-06-27'
	},

	jetpack: {
		steps: [ 'jetpack-user' ],
		destination: '/'
	}
};

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
	// do nothing. No flows to filter at the moment.
	return flowName;
}

function filterDestination( destination, dependencies, flowName ) {
	return destination;
}

const Flows = {
	filterFlowName,
	filterDestination,

	defaultFlowName: 'main',

	getFlow( flowName ) {
		let flow = Flows.getFlows()[ flowName ];

		if ( user.get() ) {
			flow = removeUserStepFromFlow( flow );
		}

		if ( ! user.get() && 'en' === i18n.getLocaleSlug() ) {
			flow = filterDesignTypeInFlow( flow );
		}

		return flow;
	},

	getFlows() {
		return flows;
	}
};

export default Flows;

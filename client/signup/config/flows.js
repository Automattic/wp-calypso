/**
 * External dependencies
 */
import assign from 'lodash/assign';
import includes from 'lodash/includes';
import reject from 'lodash/reject';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import config from 'config';
import { getLocaleSlug } from 'lib/i18n-utils';
import plansPaths from 'my-sites/plans/paths';
import stepConfig from './steps';
import userFactory from 'lib/user';

const user = userFactory();

function getCheckoutUrl( dependencies ) {
	return '/checkout/' + dependencies.siteSlug;
}

function dependenciesContainCartItem( dependencies ) {
	return dependencies.cartItem || dependencies.domainItem || dependencies.themeItem;
}

function getFreeTrialDestination( dependencies ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies );
	}

	return plansPaths.plans( dependencies.siteSlug );
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
	/* Production flows*/

	account: {
		steps: [ 'user' ],
		destination: '/',
		description: 'Create an account without a blog.',
		lastModified: '2015-07-07'
	},

	business: {
		steps: [ 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/business/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the business plan to the users cart.',
		lastModified: '2016-01-21'
	},

	premium: {
		steps: [ 'themes', 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/premium/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the business plan to the users cart.',
		lastModified: '2016-01-21'
	},

	free: {
		steps: [ 'themes', 'domains', 'user' ],
		destination: getSiteDestination,
		description: 'Create an account and a blog and default to the free plan.',
		lastModified: '2016-02-29'
	},

	businessv2: {
		steps: [ 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/business/' + dependencies.siteSlug;
		},
		description: 'Made for CT CMO trial project. Create an account and a blog, without theme selection, and then add the business plan to the users cart.',
		lastModified: '2016-02-26'
	},

	premiumv2: {
		steps: [ 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/premium/' + dependencies.siteSlug;
		},
		description: 'Made for CT CMO trial project. Create an account and a blog, without theme selection, and then add the business plan to the users cart.',
		lastModified: '2016-02-26'
	},

	'with-theme': {
		steps: [ 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Preselect a theme to activate/buy from an external source',
		lastModified: '2016-01-27'
	},

	main: {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2015-09-03'
	},

	plan: {
		steps: [ 'themes', 'domains', 'select-plan', 'user' ],
		destination: getSiteDestination,
		description: '',
		lastModified: '2016-02-02'
	},

	/* WP.com homepage flows */
	website: {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'This flow is used for the users who clicked "Create Website" on the two-button homepage.',
		lastModified: '2016-01-28'
	},

	newsite: {
		steps: [ 'survey', 'themes-headstart', 'domains-with-theme', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'Headstarted flow with verticals for EN users clicking "Create Website" on the homepage.',
		lastModified: '2016-03-21'
	},

	blog: {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'This flow is used for the users who clicked "Create Blog" on the two-button homepage.',
		lastModified: '2016-01-28'
	},

	/* On deck flows*/

	/* Testing flows */
	'test-site': {
		steps: config( 'env' ) === 'development' ? [ 'site', 'user' ] : [ 'user' ],
		destination: '/me/next/welcome',
		description: 'This flow is used to test the site step.',
		lastModified: '2015-09-22'
	},

	'delta-discover': {
		steps: [ 'user' ],
		destination: '/',
		description: 'A copy of the `account` flow for the Delta email campaigns',
		lastModified: null
	},

	'delta-blog': {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'A copy of the `blog` flow for the Delta email campaigns',
		lastModified: `2016-03-09`
	},

	'delta-site': {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'A copy of the `website` flow for the Delta email campaigns',
		lastModified: `2016-03-09`
	},

	'delta-bloggingu': {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'A copy of the `main` flow for the Delta Blogging U email campaign',
		lastModified: null
	},

	'site-user': {
		steps: [ 'site', 'user' ],
		destination: '/me/next?welcome',
		description: 'Signup flow for free site/account',
		lastModified: '2015-10-30'
	},

	headstart: {
		steps: [ 'themes-headstart', 'domains-with-theme', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Regular flow but with Headstart enabled to pre-populate site content',
		lastModified: '2015-02-01'
	},

	desktop: {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getPostsDestination,
		description: 'Signup flow for desktop app',
		lastModified: '2015-11-05'
	},

	layout: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Theme trifurcation flow',
		lastModified: '2015-12-14'
	},

	developer: {
		steps: [ 'themes', 'site', 'user' ],
		destination: '/devdocs/welcome',
		description: 'Signup flow for developers in developer environment',
		lastModified: '2015-11-23'
	},

	jetpack: {
		steps: [ 'jetpack-user' ],
		destination: '/'
	},

	'free-trial': {
		steps: [ 'themes', 'domains-with-plan', 'user' ],
		destination: getFreeTrialDestination,
		description: 'Signup flow for free trials',
		lastModified: '2016-03-21'
	},

	'new-vertical-site': {
		steps: [ 'survey', 'themes-headstart', 'domains-with-theme', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'Test flow showing Headstarted vertical themes for EN users clicking "Create Website" on the homepage.',
		lastModified: '2016-03-22'
	}
};

function removeUserStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return assign( {}, flow, {
		steps: reject( flow.steps, stepName => stepConfig[ stepName ].providesToken )
	} );
}

function filterFlowName( flowName ) {
	const defaultFlows = [ 'main', 'website' ];

	if ( includes( defaultFlows, flowName ) && abtest( 'freeTrialsInSignup' ) === 'enabled' ) {
		return 'free-trial';
	}

	const locale = getLocaleSlug();
	// Only allow the `headstart` flow for EN users.
	if ( 'headstart' === flowName && 'en' !== locale && 'en-gb' !== locale ) {
		return 'main';
	}

	// Headstarted "default" flow (`newsite`) with vertical selection for EN users, coming from the homepage single button.
	if ( 'website' === flowName && ( 'en' === locale || 'en-gb' === locale ) ) {
		return ( 'verticalThemes' === abtest( 'verticalThemes' ) ) ? 'new-vertical-site' : 'newsite';
	}

	return flowName;
}

export default {
	filterFlowName: filterFlowName,

	defaultFlowName: 'main',

	getFlow( flowName ) {
		return user.get() ? removeUserStepFromFlow( flows[ flowName ] ) : flows[ flowName ];
	},

	getFlows() {
		return flows;
	}
};

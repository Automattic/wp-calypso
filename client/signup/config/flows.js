/**
 * External dependencies
 */
import assign from 'lodash/assign';
import includes from 'lodash/includes';
import reject from 'lodash/reject';

/**
 * Internal dependencies
 */
import { abtest, getABTestVariation } from 'lib/abtest';
import config from 'config';
import { isOutsideCalypso } from 'lib/url';
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
		steps: [ 'domains-only', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/business/' + dependencies.siteSlug;
		},
		description: 'Made for CT CMO trial project. Create an account and a blog, without theme selection, and then add the business plan to the users cart.',
		lastModified: '2016-02-26'
	},

	premiumv2: {
		steps: [ 'domains-only', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/premium/' + dependencies.siteSlug;
		},
		description: 'Made for CT CMO trial project. Create an account and a blog, without theme selection, and then add the business plan to the users cart.',
		lastModified: '2016-02-26'
	},

	'with-theme': {
		steps: [ 'domains-only', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Preselect a theme to activate/buy from an external source',
		lastModified: '2016-01-27'
	},

	main: {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2016-05-03'
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
		description: 'This flow was originally used for the users who clicked "Create Website" on the two-button homepage. It's now linked to from the default homepage CTA as the main flow was slightly behind given translations.',
		lastModified: '2016-05-03'
	},

	blog: {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'This flow was originally used for the users who clicked "Create Blog" on the two-button homepage. It's now used from blog-specific landing pages so that verbiage in survey steps refers to "blog" instead of "website".',
		lastModified: '2016-05-03'
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
		description: 'A copy of the `account` flow for the Delta email campaigns. 50% of users who go through this flow receive a reader-specific drip email series.',
		lastModified: '2016-05-03'
	},

	'delta-blog': {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'A copy of the `blog` flow for the Delta email campaigns. 50% of users who go through this flow receive a blogging-specific drip email series.',
		lastModified: '2016-03-09'
	},

	'delta-site': {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'A copy of the `website` flow for the Delta email campaigns. 50% of users who go through this flow receive a website-specific drip email series.',
		lastModified: '2016-03-09'
	},

	'domains-with-premium': {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getSiteDestination,
		description: 'Test for domains with plans only',
		lastModified: '2016-04-27'
	},

	'site-user': {
		steps: [ 'site', 'user' ],
		destination: '/me/next?welcome',
		description: 'Signup flow for free site/account',
		lastModified: '2015-10-30'
	},

	desktop: {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getPostsDestination,
		description: 'Signup flow for desktop app',
		lastModified: '2015-11-05'
	},

	layout: {
		steps: [ 'survey', 'design-type', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getSiteDestination,
		description: 'Signup flow with homepage pattern selection (Triforce) step',
		lastModified: '2016-04-21'
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

	if ( includes( defaultFlows, flowName ) && abtest( 'domainsWithPlansOnly' ) === 'plansOnly' ) {
		return 'domains-with-premium';
	}

	if ( includes( defaultFlows, flowName ) && 'notTested' === getABTestVariation( 'freeTrialsInSignup' ) && 'triforce' === abtest( 'triforce' ) ) {
		return 'layout';
	}

	return flowName;
}

function filterDestination( destination, dependencies, flowName ) {
	if ( config.isEnabled( 'guided-tours' ) ) {
		return getGuidedToursDestination( destination, dependencies, flowName );
	}

	return destination;
}

function getGuidedToursDestination( destination, dependencies, flowName ) {
	const guidedToursVariant = abtest( 'guidedTours' );
	const tourName = 'main';
	const disabledFlows = [ 'account', 'site-user', 'jetpack' ];
	const siteSlug = dependencies.siteSlug;
	const baseUrl = `/stats/${ siteSlug }`;

	// TODO(ehg): Build the query arg properly, so we don't have problems with
	// destinations that already have query strings in
	function getVariantUrl( variant ) {
		const external = isOutsideCalypso( destination );
		const variantUrls = {
			original: destination,
			guided: external ? `${ baseUrl }?tour=${ tourName }` : `${ destination }?tour=${ tourName }`,
			calypsoOnly: external ? baseUrl : destination,
		};

		return variantUrls[ variant ] || variantUrls.original;
	}

	if ( includes( disabledFlows, flowName ) || ! siteSlug ) {
		return destination;
	}

	return getVariantUrl( guidedToursVariant );
}

export default {
	filterFlowName,
	filterDestination,

	defaultFlowName: 'main',

	getFlow( flowName ) {
		return user.get() ? removeUserStepFromFlow( flows[ flowName ] ) : flows[ flowName ];
	},

	getFlows() {
		return flows;
	}
};

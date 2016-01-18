/**
 * External dependencies
 */
var assign = require( 'lodash/object/assign' ),
	reject = require( 'lodash/collection/reject' );

/**
* Internal dependencies
*/
var config = require( 'config' ),
	stepConfig = require( './steps' ),
	user = require( 'lib/user' )();

function getCheckoutDestination( dependencies ) {
	if ( dependencies.cartItem || dependencies.domainItem ) {
		return '/checkout/' + dependencies.siteSlug;
	}

	return 'https://' + dependencies.siteSlug;
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
		steps: [ 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/business/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the business plan to the users cart.',
		lastModified: null
	},

	premium: {
		steps: [ 'domains', 'user' ],
		destination: function( dependencies ) {
			return '/plans/select/premium/' + dependencies.siteSlug;
		},
		description: 'Create an account and a blog and then add the business plan to the users cart.',
		lastModified: null
	},

	main: {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2015-09-03'
	},

	/* On deck flows*/

	/* Testing flows */
	'test-site': {
		steps: config( 'env' ) === 'development' ? [ 'site', 'user' ] : [ 'user' ],
		destination: '/me/next/welcome',
		description: 'This flow is used to test the site step.',
		lastModified: '2015-09-22'
	},

	verticals: {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'survey-user' ],
		destination: getCheckoutDestination,
		description: 'Categorizing blog signups for Verticals Survey',
		lastModified: '2015-12-10'
	},

	'delta-discover': {
		steps: [ 'user' ],
		destination: '/',
		description: 'A copy of the `account` flow for the Delta email campaigns',
		lastModified: null
	},

	'delta-blog': {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'A copy of the `main` flow for the Delta email campaigns',
		lastModified: null
	},

	'delta-site': {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'A copy of the `main` flow for the Delta email campaigns',
		lastModified: null
	},

	'delta-bloggingu': {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'A copy of the `main` flow for the Delta Blogging U email campaign',
		lastModified: null
	},

	'site-user': {
		steps: [ 'site', 'user' ],
		destination: '/me/next?welcome',
		description: 'Signup flow for free site/account',
		lastModified: '2015-10-30'
	},

	desktop: {
		steps: [ 'themes', 'site', 'user' ],
		destination: '/me/next?welcome',
		description: 'Signup flow for desktop app',
		lastModified: '2015-11-05'
	},

	layout: {
		steps: [ 'design-type', 'themes', 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
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
		steps: [ 'themes', 'site', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'Signup flow for free trials',
		lastModified: '2015-12-18'
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

function getCurrentFlowNameFromTest() {
	// No tests currently running
	return 'main';
}

module.exports = {
	currentFlowName: getCurrentFlowNameFromTest(),

	defaultFlowName: 'main',

	getFlow: function( flowName ) {
		return user.get() ? removeUserStepFromFlow( flows[ flowName ] ) : flows[ flowName ];
	},

	getFlows: function() {
		return flows;
	}
};

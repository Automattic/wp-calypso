/**
 * External dependencies
 */
var assign = require( 'lodash/object/assign' ),
	includes = require( 'lodash/collection/includes' ),
	reject = require( 'lodash/collection/reject' );

/**
* Internal dependencies
*/
var config = require( 'config' ),
	stepConfig = require( './steps' ),
	abtest = require( 'lib/abtest' ).abtest,
	user = require( 'lib/user' )();

function getCheckoutDestination( dependencies ) {
	if ( dependencies.cartItem || dependencies.domainItem || dependencies.themeItem ) {
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

	'with-theme': {
		steps: [ 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'Preselect a theme to activate/buy from an external source',
		lastModified: '2016-01-27'
	},

	main: {
		steps: [ 'themes', 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'The current best performing flow in AB tests',
		lastModified: '2015-09-03'
	},

	plan: {
		steps: [ 'themes', 'site', 'select-plan', 'user' ],
		destination: getCheckoutDestination,
		description: '',
		lastModified: '2016-02-02'
	},

	/* WP.com homepage flows */
	website: {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'This flow is used for the users who clicked "Create Website" on the two-button homepage.',
		lastModified: '2016-01-28'
	},

	blog: {
		steps: [ 'survey', 'themes', 'domains', 'plans', 'user' ],
		destination: getCheckoutDestination,
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

	headstart: {
		steps: [ 'themes-headstart', 'domains-with-theme', 'plans', 'user' ],
		destination: getCheckoutDestination,
		description: 'Regular flow but with Headstart enabled to pre-populate site content',
		lastModified: '2015-02-01'
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

function filterFlowName( flowName ) {
	const headstartFlows = [ 'blog', 'website' ];
	if ( includes( headstartFlows, flowName ) && 'headstart' === abtest( 'headstart' ) ) {
		return 'headstart';
	}
	return flowName;
}

module.exports = {
	filterFlowName: filterFlowName,

	defaultFlowName: 'main',

	getFlow: function( flowName ) {
		return user.get() ? removeUserStepFromFlow( flows[ flowName ] ) : flows[ flowName ];
	},

	getFlows: function() {
		return flows;
	}
};

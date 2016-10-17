/**
 * External dependencies
 */
import { current } from 'page';
import i18n from 'i18n-calypso';

/**
* Internal dependencies
*/
import stepActions from 'lib/signup/step-actions';

module.exports = {
	survey: {
		stepName: 'survey',
		props: {
			surveySiteType: ( current && current.toString().match( /\/start\/(blog|delta-blog)/ ) ) ? 'blog' : 'site'
		},
		providesDependencies: [ 'surveySiteType', 'surveyQuestion' ]
	},

	themes: {
		stepName: 'themes',
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'theme' ]
	},

	'design-type': {
		stepName: 'design-type',
		providesDependencies: [ 'designType' ]
	},

	'design-type-with-store': {
		stepName: 'design-type-with-store',
		providesDependencies: [ 'designType' ]
	},

	site: {
		stepName: 'site',
		apiRequestFunction: stepActions.createSite,
		providesDependencies: [ 'siteSlug' ]
	},

	user: {
		stepName: 'user',
		apiRequestFunction: stepActions.createAccount,
		providesToken: true,
		providesDependencies: [ 'bearer_token', 'username' ]
	},

	'survey-user': {
		stepName: 'survey-user',
		apiRequestFunction: stepActions.createAccount,
		providesToken: true,
		dependencies: [ 'surveySiteType', 'surveyQuestion' ],
		providesDependencies: [ 'bearer_token', 'username' ]
	},

	'site-title': {
		stepName: 'site-title',
		providesDependencies: [ 'siteTitle' ]
	},

	test: {
		stepName: 'test'
	},

	plans: {
		stepName: 'plans',
		apiRequestFunction: stepActions.addPlanToCart,
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'cartItem' ]
	},

	domains: {
		stepName: 'domains',
		apiRequestFunction: stepActions.createSiteWithCart,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem', 'privacyItem' ],
		dependencies: [ 'theme', 'surveyQuestion' ],
		delayApiRequestUntilComplete: true
	},

	'domains-with-plan': {
		stepName: 'domains-with-plan',
		apiRequestFunction: stepActions.createSiteWithCartAndStartFreeTrial,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem', 'privacyItem' ],
		dependencies: [ 'theme' ],
		delayApiRequestUntilComplete: true
	},

	'domains-only': {
		stepName: 'domains-only',
		apiRequestFunction: stepActions.createSiteWithCart,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem', 'privacyItem' ],
		delayApiRequestUntilComplete: true
	},

	'jetpack-user': {
		stepName: 'jetpack-user',
		apiRequestFunction: stepActions.createAccount,
		providesToken: true,
		props: {
			headerText: i18n.translate( 'Create an account for Jetpack' ),
			subHeaderText: i18n.translate( 'You\'re moments away from connecting Jetpack.' )
		},
		providesDependencies: [ 'bearer_token', 'username' ]
	},

	'get-dot-blog-plans': {
		apiRequestFunction: stepActions.createSiteWithCart,
		stepName: 'get-dot-blog-plans',
		dependencies: [ 'cartItem' ],
		providesDependencies: [ 'cartItem', 'siteSlug', 'siteId', 'domainItem', 'themeItem' ]
	},

	'get-dot-blog-themes': {
		stepName: 'get-dot-blog-themes',
		props: {
			designType: 'blog'
		},
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'theme' ]
	},

	'get-dot-blog-survey': {
		stepName: 'get-dot-blog-survey',
		props: {
			surveySiteType: 'blog'
		},
		providesDependencies: [ 'surveySiteType', 'surveyQuestion' ]
	},
};

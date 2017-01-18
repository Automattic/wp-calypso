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
		dependencies: [ 'siteSlug', 'domainItem' ],
		providesDependencies: [ 'cartItem', 'privacyItem' ]
	},

	// The user can skip the plans step when creating a domain-only site
	// through the `domain-first` flow. This is just a version of `plans` that
	// does not necessarily provide any dependencies.
	'domain-first-plans': {
		stepName: 'domain-first-plans',
		apiRequestFunction: stepActions.addPlanToCart,
		dependencies: [ 'siteSlug', 'domainItem' ],
	},

	domains: {
		stepName: 'domains',
		apiRequestFunction: stepActions.createSiteWithCart,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
		dependencies: [ 'theme' ],
		delayApiRequestUntilComplete: true
	},

	'domains-with-plan': {
		stepName: 'domains-with-plan',
		apiRequestFunction: stepActions.createSiteWithCartAndStartFreeTrial,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
		dependencies: [ 'theme' ],
		delayApiRequestUntilComplete: true
	},

	'domains-theme-preselected': {
		stepName: 'domains-theme-preselected',
		apiRequestFunction: stepActions.createSiteWithCart,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
		delayApiRequestUntilComplete: true
	},

	'domain-only': {
		stepName: 'domain-only',
		apiRequestFunction: stepActions.createSiteWithCart,
		props: {
			isDomainOnly: true
		},
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
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
		providesDependencies: [ 'cartItem', 'siteSlug', 'siteId', 'domainItem', 'themeItem', 'privacyItem' ]
	},

	'get-dot-blog-themes': {
		stepName: 'get-dot-blog-themes',
		props: {
			designType: 'blog'
		},
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'theme' ]
	},

	// Currently, this step explicitly submits other steps to skip them, and
	// should not be used outside of the `domain-first` flow.
	'site-or-domain': {
		stepName: 'site-or-domain',
		props: {
			headerText: i18n.translate( 'Do you want to use this domain yet?' ),
			subHeaderText: i18n.translate( "Don't worry you can easily add a site later if you're not ready" )
		},
		providesDependencies: [ 'designType' ]
	},
};

/**
 * External dependencies
 */
import { current } from 'page';
import i18n from 'i18n-calypso';

/**
* Internal dependencies
*/
import stepActions from 'lib/signup/step-actions';

export default {
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
		providesDependencies: [ 'themeSlugWithRepo' ]
	},

	'portfolio-themes': {
		stepName: 'portfolio-themes',
		props: {
			designType: 'grid'
		},
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'themeSlugWithRepo' ]
	},

	// `themes` does not update the theme for an existing site as we normally
	// do this when the site is created. In flows where a site is merely being
	// updated, we need to use a different API request function.
	'themes-site-selected': {
		stepName: 'themes-site-selected',
		dependencies: [ 'siteSlug', 'themeSlugWithRepo' ],
		providesDependencies: [ 'themeSlugWithRepo' ],
		apiRequestFunction: stepActions.setThemeOnSite,
		props: {
			headerText: i18n.translate( 'Choose a theme for your new site.' ),
		}
	},

	'plans-site-selected': {
		stepName: 'plans-site-selected',
		apiRequestFunction: stepActions.addPlanToCart,
		dependencies: [ 'siteSlug', 'siteId' ],
		providesDependencies: [ 'cartItem', 'privacyItem' ]
	},

	'design-type': {
		stepName: 'design-type',
		providesDependencies: [ 'designType', 'themeSlugWithRepo' ]
	},

	'design-type-with-store': {
		stepName: 'design-type-with-store',
		providesDependencies: [ 'designType', 'themeSlugWithRepo' ]
	},

	site: {
		stepName: 'site',
		apiRequestFunction: stepActions.createSite,
		providesDependencies: [ 'siteSlug' ]
	},

	'rebrand-cities-welcome': {
		stepName: 'rebrand-cities-welcome',
		apiRequestFunction: stepActions.createSiteWithCart,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
		props: {
			isDomainOnly: false
		},
		delayApiRequestUntilComplete: true
	},

	user: {
		stepName: 'user',
		apiRequestFunction: stepActions.createAccount,
		providesToken: true,
		providesDependencies: [ 'bearer_token', 'username' ],
		unstorableDependencies: [ 'bearer_token' ],
	},

	'user-social': {
		stepName: 'user-social',
		apiRequestFunction: stepActions.createAccount,
		providesToken: true,
		providesDependencies: [ 'bearer_token', 'username' ],
		unstorableDependencies: [ 'bearer_token' ],
		props: {
			headerText: i18n.translate( 'Create your account.' ),
			isSocialSignupEnabled: true
		},
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
		dependencies: [ 'siteSlug', 'siteId', 'domainItem' ],
		providesDependencies: [ 'cartItem', 'privacyItem' ]
	},

	domains: {
		stepName: 'domains',
		apiRequestFunction: stepActions.createSiteWithCart,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
		props: {
			isDomainOnly: false
		},
		dependencies: [ 'themeSlugWithRepo' ],
		delayApiRequestUntilComplete: true
	},

	'domains-theme-preselected': {
		stepName: 'domains-theme-preselected',
		apiRequestFunction: stepActions.createSiteWithCart,
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
		props: {
			isDomainOnly: false
		},
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

	'oauth2-user': {
		stepName: 'oauth2-user',
		apiRequestFunction: stepActions.createAccount,
		props: {
			oauth2Signup: true
		},
		providesToken: true,
		providesDependencies: [ 'bearer_token', 'username', 'oauth2_client_id', 'oauth2_redirect' ]
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
		providesDependencies: [ 'themeSlugWithRepo' ]
	},

	// Currently, these two steps explicitly submit other steps to skip them, and
	// should not be used outside of the `domain-first` flow.
	'site-or-domain': {
		stepName: 'site-or-domain',
		props: {
			headerText: i18n.translate( 'Choose how you want to use your domain.' ),
			subHeaderText: i18n.translate( "Don't worry you can easily add a site later if you're not ready." )
		},
		providesDependencies: [ 'designType', 'siteId', 'siteSlug', 'siteUrl', 'domainItem', 'themeSlugWithRepo' ],
	},
	'site-picker': {
		stepName: 'site-picker',
		apiRequestFunction: stepActions.createSiteOrDomain,
		props: {
			headerText: i18n.translate( 'Choose your site?' ),
		},
		providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeSlugWithRepo' ],
		dependencies: [ 'cartItem', 'designType', 'domainItem', 'privacyItem', 'siteUrl', 'themeSlugWithRepo' ],
		delayApiRequestUntilComplete: true
	},
};

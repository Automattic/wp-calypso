/**
 * External dependencies
 */
import { current } from 'page';

/**
* Internal dependencies
*/
import stepActions from 'lib/signup/step-actions';
import i18n from 'lib/mixins/i18n';

module.exports = {
	themes: {
		stepName: 'themes',
		apiRequestFunction: stepActions.setThemeOnSite,
		dependencies: [ 'siteSlug' ]
	},

	'themes-headstart': {
		stepName: 'themes-headstart',
		props: {
			useHeadstart: true,
		},
		apiRequestFunction: stepActions.setThemeOnSite,
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'theme' ]
	},

	'design-type': {
		stepName: 'design-type',
		providesDependencies: [ 'themes' ]
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

	test: {
		stepName: 'test',
	},

	'survey-user': {
		stepName: 'survey-user',
		apiRequestFunction: stepActions.createAccount,
		dependencies: [ 'surveySiteType', 'surveyQuestion' ],
		providesToken: true,
		providesDependencies: [ 'bearer_token', 'username' ]
	},

	survey: {
		stepName: 'survey',
		props: {
			surveySiteType: ( '/start/vert-blog' === current ) ? 'blog' : 'site'
		},
		providesDependencies: [ 'surveySiteType', 'surveyQuestion' ]
	},

	plans: {
		stepName: 'plans',
		apiRequestFunction: stepActions.addPlanToCart,
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'cartItem' ]
	},

	domains: {
		stepName: 'domains',
		apiRequestFunction: stepActions.addDomainItemsToCart,
		providesDependencies: [ 'siteSlug', 'domainItem' ],
		delayApiRequestUntilComplete: true
	},

	'domains-with-theme': {
		stepName: 'domains-with-theme',
		apiRequestFunction: stepActions.addDomainItemsToCart,
		providesDependencies: [ 'siteSlug', 'domainItem' ],
		dependencies: [ 'theme' ],
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
	}
};

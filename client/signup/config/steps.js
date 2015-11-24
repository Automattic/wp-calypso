import stepActions from 'lib/signup/step-actions';
import i18n from 'lib/mixins/i18n';

module.exports = {
	themes: {
		stepName: 'themes',
		apiRequestFunction: stepActions.setThemeOnSite,
		dependencies: [ 'siteSlug' ]
	},

	'theme-headstart': {
		stepName: 'theme-headstart',
		props: {
			useHeadstart: true
		},
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'theme', 'images' ]
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
		dependencies: [ 'theme', 'images' ],
		delayApiRequestUntilComplete: true
	},

	'theme-dss': {
		stepName: 'theme-dss',
		props: {
			useHeadstart: true,
			themes: [ 'Sela', 'Goran', 'Twenty Fifteen', 'Sequential', 'Colinear', 'Edin' ]
		},
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'theme', 'images' ]
	},

	'jetpack-user': {
		stepName: 'jetpack-user',
		apiRequestFunction: stepActions.createAccount,
		providesToken: true,
		props: {
			headerText: i18n.translate( 'Create an account for Jetpack' ),
			subHeaderText: i18n.translate( 'You\'re moments away from connecting Jetpack.' )
		},
		dependencies: [ 'jetpackRedirect' ],
		providesDependencies: [ 'bearer_token', 'username', 'jetpackRedirect' ]
	}
};

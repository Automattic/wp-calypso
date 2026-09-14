export default {
	stepA: {
		stepName: 'stepA',
	},

	stepB: {
		stepName: 'stepB',
	},

	stepRequiringSiteSlug: {
		stepName: 'stepRequiringSiteSlug',
		dependencies: [ 'siteSlug' ],
	},

	asyncStep: {
		stepName: 'asyncStep',
		apiRequestFunction: function ( callback, dependencies, stepData ) {
			setTimeout( callback, 0 );
			stepData.done();
		},
	},

	siteCreation: {
		stepName: 'siteCreation',
		dependencies: [ 'bearer_token' ],
		providesDependencies: [ 'siteSlug' ],
		apiRequestFunction: function ( callback, dependencies, stepData ) {
			setTimeout( function () {
				callback( null, { siteSlug: 'testsite.wordpress.com' } );
				stepData.stepCallback( dependencies );
			}, 0 );
		},
	},

	userCreation: {
		stepName: 'userCreation',
		providesToken: true,
		providesDependencies: [ 'bearer_token' ],
		apiRequestFunction: function ( callback ) {
			setTimeout( function () {
				callback( null, { bearer_token: 'TOKEN' } );
			}, 0 );
		},
	},

	userCreationWithoutToken: {
		stepName: 'userCreation',
		providesToken: true,
		providesDependencies: [ 'bearer_token' ],
		apiRequestFunction: function ( callback ) {
			setTimeout( callback, 0 );
		},
	},

	delayedStep: {
		stepName: 'delayedStep',
		component: null,
		delayApiRequestUntilComplete: true,
		apiRequestFunction: function ( callback, dependencies, stepData ) {
			stepData.stepCallback();
			setTimeout( callback, 0 );
		},
	},

	'domains-launch': {
		stepName: 'domains-launch',
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'domainItem' ],
	},

	plans: {
		stepName: 'plans',
		dependencies: [ 'siteSlug' ],
		providesDependencies: [ 'cartItems' ],
	},

	'site-type': {
		stepName: 'site-type',
		providesDependencies: [ 'siteType', 'themeSlugWithRepo' ],
	},

	'site-topic': {
		stepName: 'site-topic',
		providesDependencies: [ 'siteTopic' ],
	},

	'site-topic-and-title': {
		stepName: 'site-topic-and-title',
		providesDependencies: [ 'siteTopic', 'siteTitle' ],
	},

	'site-topic-with-optional-theme': {
		stepName: 'site-topic-with-optional-theme',
		providesDependencies: [ 'siteTopic', 'themeSlugWithRepo' ],
		optionalDependencies: [ 'themeSlugWithRepo' ],
	},

	'site-topic-with-optional-survey-question': {
		stepName: 'site-topic-with-optional-survey-question',
		providesDependencies: [ 'siteTopic', 'surveyQuestion' ],
		optionalDependencies: [ 'surveyQuestion' ],
	},
};

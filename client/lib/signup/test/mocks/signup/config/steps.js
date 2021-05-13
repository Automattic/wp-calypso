/**
 * External dependencies
 */

import { defer } from 'lodash';

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
			defer( callback );
			stepData.done();
		},
	},

	siteCreation: {
		stepName: 'siteCreation',
		dependencies: [ 'bearer_token' ],
		providesDependencies: [ 'siteSlug' ],
		apiRequestFunction: function ( callback, dependencies, stepData ) {
			defer( function () {
				callback( null, { siteSlug: 'testsite.wordpress.com' } );
				stepData.stepCallback( dependencies );
			} );
		},
	},

	userCreation: {
		stepName: 'userCreation',
		providesToken: true,
		providesDependencies: [ 'bearer_token' ],
		apiRequestFunction: function ( callback ) {
			defer( function () {
				callback( null, { bearer_token: 'TOKEN' } );
			} );
		},
	},

	userCreationWithoutToken: {
		stepName: 'userCreation',
		providesToken: true,
		providesDependencies: [ 'bearer_token' ],
		apiRequestFunction: function ( callback ) {
			defer( callback );
		},
	},

	delayedStep: {
		stepName: 'delayedStep',
		component: null,
		delayApiRequestUntilComplete: true,
		apiRequestFunction: function ( callback, dependencies, stepData ) {
			stepData.stepCallback();
			defer( callback );
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
		providesDependencies: [ 'cartItem' ],
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

export const isDomainStepSkippable = jest.fn( () => false );

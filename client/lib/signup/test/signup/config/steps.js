/**
 * External dependencies
 */
import defer from 'lodash/defer';

module.exports = {
	stepA: {
		stepName: 'stepA'
	},

	stepB: {
		stepName: 'stepB'
	},

	stepRequiringSiteSlug: {
		stepName: 'stepRequiringSiteSlug',
		dependencies: [ 'siteSlug' ]
	},

	asyncStep: {
		stepName: 'asyncStep',
		apiRequestFunction: function( callback, dependencies, stepData ) {
			defer( callback );
			stepData.done();
		}
	},

	siteCreation: {
		stepName: 'siteCreation',
		dependencies: [ 'bearer_token' ],
		providesDependencies: [ 'siteSlug' ],
		apiRequestFunction: function( callback, dependencies, stepData ) {
			defer( function() {
				callback( [], { siteSlug: 'testsite.wordpress.com' } );
				stepData.stepCallback( dependencies );
			} );
		}
	},

	userCreation: {
		stepName: 'userCreation',
		providesToken: true,
		providesDependencies: [ 'bearer_token' ],
		apiRequestFunction: function( callback ) {
			defer( function() {
				callback( [], { bearer_token: 'TOKEN' } );
			} );
		}
	},

	userCreationWithoutToken: {
		stepName: 'userCreation',
		providesToken: true,
		providesDependencies: [ 'bearer_token' ],
		apiRequestFunction: function( callback ) {
			callback();
		}
	},

	delayedStep: {
		stepName: 'delayedStep',
		component: null,
		delayApiRequestUntilComplete: true,
		apiRequestFunction: function( callback, dependencies, stepData ) {
			stepData.stepCallback();
			defer( callback );
		}
	}
};

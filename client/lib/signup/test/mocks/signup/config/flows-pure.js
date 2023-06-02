const flows = {
	simple_flow: {
		steps: [ 'stepA', 'stepB' ],
		destination: '/',
	},

	flow_with_async: {
		steps: [ 'userCreation', 'asyncStep' ],
	},

	flow_with_dependencies: {
		steps: [ 'siteCreation', 'userCreation' ],
		destination: function ( dependencies ) {
			return '/checkout/' + dependencies.siteSlug;
		},
	},

	invalid_flow_with_dependencies: {
		steps: [ 'siteCreation', 'userCreationWithoutToken' ],
	},

	flowWithDelay: {
		steps: [ 'delayedStep', 'stepA' ],
	},

	flowWithProvidedDependencies: {
		steps: [ 'stepRequiringSiteSlug' ],
		providesDependenciesInQuery: [ 'siteSlug' ],
	},

	flowWithSiteTopic: {
		steps: [ 'stepA', 'stepB', 'site-topic' ],
	},

	flowWithSiteTopicAndTitle: {
		steps: [ 'stepA', 'stepB', 'site-topic-and-title' ],
	},

	flowWithSiteTopicAndSurvey: {
		steps: [ 'stepA', 'stepB', 'site-topic', 'survey' ],
	},

	flowWithSiteTopicWithOptionalTheme: {
		steps: [ 'stepA', 'stepB', 'site-topic-with-optional-theme' ],
	},

	flowWithSiteTopicWithOptionalSurveyQuestion: {
		steps: [ 'stepA', 'stepB', 'site-topic-with-optional-survey-question' ],
	},
};
export default flows;

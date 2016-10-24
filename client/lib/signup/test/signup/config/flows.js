var flows = {
	simple_flow: {
		steps: [ 'stepA', 'stepB' ],
		destination: '/'
	},

	flow_with_async: {
		steps: [ 'userCreation', 'asyncStep' ],
		destination: function( dependencies ) {
			return '/checkout/' + dependencies.siteSlug;
		}
	},

	flow_with_dependencies: {
		steps: [ 'siteCreation', 'userCreation' ]
	},

	invalid_flow_with_dependencies: {
		steps: [ 'siteCreation', 'userCreationWithoutToken' ]
	},

	flowWithDelay: {
		steps: [ 'delayedStep', 'stepA' ]
	}
};

module.exports = {
	defaultFlowName: 'simple_flow',

	getFlow: function( flowName ) {
		return flows[ flowName ];
	}
};

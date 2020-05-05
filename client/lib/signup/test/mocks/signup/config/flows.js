/**
 * Internal dependencies
 */
import flows from './flows-pure';

export default {
	defaultFlowName: 'simple_flow',

	getFlow: function ( flowName ) {
		return flows[ flowName ];
	},

	excludeStep: jest.fn(),
	resetExcludedSteps: jest.fn(),
};

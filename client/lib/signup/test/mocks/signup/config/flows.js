import { vi } from 'vitest';
import flows from './flows-pure';

export default {
	defaultFlowName: 'simple_flow',

	getFlow: function ( flowName ) {
		return flows[ flowName ];
	},

	excludedSteps: [],
	excludeStep: vi.fn(),
	resetExcludedStep: vi.fn(),
	resetExcludedSteps: vi.fn(),
};

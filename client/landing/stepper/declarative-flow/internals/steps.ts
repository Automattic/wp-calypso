const STEPS = {
	CELEBRATION: {
		slug: 'celebration-step',
		asyncComponent: () => import( './steps-repository/celebration-step' ),
	},

	ERROR: {
		slug: 'error',
		asyncComponent: () => import( './steps-repository/error-step' ),
	},

	PATTERN_ASSEMBLER: {
		slug: 'patternAssembler',
		asyncComponent: () => import( './steps-repository/pattern-assembler' ),
	},

	PROCESSING: {
		slug: 'processing',
		asyncComponent: () => import( './steps-repository/processing-step' ),
	},
};

export default STEPS;

export const STEPS = {
	CELEBRATION: {
		slug: 'celebration-step',
		asyncComponent: () => import( './celebration-step' ),
	},

	ERROR: {
		slug: 'error',
		asyncComponent: () => import( './error-step' ),
	},

	PATTERN_ASSEMBLER: {
		slug: 'patternAssembler',
		asyncComponent: () => import( './pattern-assembler' ),
	},

	PROCESSING: { slug: 'processing', asyncComponent: () => import( './processing-step' ) },
};

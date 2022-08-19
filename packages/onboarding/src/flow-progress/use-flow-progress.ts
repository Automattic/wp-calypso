interface FlowProgress {
	stepName: string | null;
	flowName: string | null;
}

export const useFlowProgress = ( { stepName, flowName }: FlowProgress ) => {
	if ( ! stepName || ! flowName ) {
		return;
	}

	const flows: Record< string, { [ step: string ]: number } > = {
		newsletter: {
			intro: 0,
			user: 1,
			'newsletter-setup': 2,
			domains: 3,
			plans: 4,
			subscriber: 5,
			launchpad: 6,
		},
		'link-in-bio': {
			intro: 0,
			user: 1,
			pattern: 2,
			'link-in-bio': 3,
			domains: 4,
			plans: 5,
			launchpad: 6,
		},
	};
	const flow = flows[ flowName ];

	return { position: flow[ stepName ], count: Object.keys( flow ).length };
};

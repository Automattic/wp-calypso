interface FlowProgress {
	stepName: string;
	flowName: string;
}

export const useFlowProgress = ( props: FlowProgress | null ) => {
	if ( ! props ) {
		return { position: 0, count: 0 };
	}
	const { stepName, flowName } = props;
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

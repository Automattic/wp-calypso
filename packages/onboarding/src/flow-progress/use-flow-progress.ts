interface FlowProgress {
	stepName: string;
	flowName: string;
}

export const useFlowProgress = ( props: FlowProgress | undefined ) => {
	if ( ! props ) {
		return;
	}
	const { stepName, flowName } = props;

	const flows: Record< string, { [ step: string ]: number } > = {
		newsletter: {
			intro: 0,
			user: 1,
			newsletterSetup: 2,
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

	return { progress: flow[ stepName ], count: Object.keys( flow ).length };
};

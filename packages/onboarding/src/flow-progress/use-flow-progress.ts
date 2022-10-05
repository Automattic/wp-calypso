interface FlowProgress {
	stepName?: string;
	flowName?: string;
}

const flows: Record< string, { [ step: string ]: number } > = {
	newsletter: {
		intro: 0,
		user: 1,
		newsletterSetup: 2,
		domains: 3,
		plans: 4,
		subscribers: 5,
		launchpad: 6,
	},
	'link-in-bio': {
		intro: 0,
		user: 1,
		patterns: 2,
		linkInBioSetup: 3,
		domains: 4,
		plans: 5,
		launchpad: 6,
	},
	videopress: {
		intro: 0,
		user: 1,
		options: 2,
		videomakerSetup: 3,
		chooseADomain: 4,
		chooseAPlan: 5,
		processing: 6,
		launchpad: 7,
	},
};

export const useFlowProgress = ( { stepName, flowName }: FlowProgress = {} ) => {
	if ( ! stepName || ! flowName ) {
		return;
	}

	const flowProgress = flows[ flowName ];

	return (
		flowProgress && {
			progress: flowProgress[ stepName ],
			count: Object.keys( flowProgress ).length,
		}
	);
};

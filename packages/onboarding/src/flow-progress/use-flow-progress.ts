/* eslint-disable no-restricted-imports */
interface FlowProgress {
	stepName?: string;
	flowName?: string;
}

const flows: Record< string, { [ step: string ]: number } > = {
	newsletter: {
		intro: 0,
		user: 0,
		newsletterSetup: 1,
		domains: 2,
		'plans-newsletter': 3,
		subscribers: 4,
		launchpad: 5,
	},
	'link-in-bio': {
		intro: 0,
		user: 0,
		patterns: 1,
		linkInBioSetup: 2,
		domains: 3,
		plans: 4,
		launchpad: 5,
	},
	videopress: {
		intro: 0,
		user: 1,
		options: 2,
		chooseADomain: 3,
		chooseAPlan: 4,
		processing: 5,
		launchpad: 6,
	},
};

export const useFlowProgress = ( { stepName, flowName }: FlowProgress = {} ) => {
	if ( ! stepName || ! flowName ) {
		return;
	}

	const flow = flows[ flowName ];

	return (
		flow && {
			progress: flow[ stepName ],
			count: Math.max( ...Object.values( flow ) ),
		}
	);
};

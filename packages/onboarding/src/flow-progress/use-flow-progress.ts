import { LINK_IN_BIO_FLOW, LINK_IN_BIO_TLD_FLOW } from '../utils/flows';

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
	[ LINK_IN_BIO_FLOW ]: {
		intro: 0,
		user: 0,
		patterns: 1,
		linkInBioSetup: 2,
		domains: 3,
		plans: 4,
		launchpad: 5,
	},
	[ LINK_IN_BIO_TLD_FLOW ]: {
		domains: 0,
		user: 1,
		patterns: 2,
		linkInBioSetup: 3,
		plans: 4,
		launchpad: 5,
	},
	free: {
		intro: 0,
		user: 0,
		patterns: 1,
		freeSetup: 2,
		launchpad: 3,
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

	const flow = flows[ flowName ];

	return (
		flow && {
			progress: flow[ stepName ],
			count: Math.max( ...Object.values( flow ) ),
		}
	);
};

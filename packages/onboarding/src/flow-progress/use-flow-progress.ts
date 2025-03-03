import { COPY_SITE_FLOW } from '../utils/flows';

/* eslint-disable no-restricted-imports */
interface FlowProgress {
	stepName?: string;
	flowName?: string;
	variantSlug?: string;
}

const flows: Record< string, { [ step: string ]: number } > = {
	newsletter: {
		intro: 0,
		user: 0,
		newsletterSetup: 0,
		newsletterGoals: 1,
		domains: 2,
		'plans-newsletter': 3,
		subscribers: 4,
		launchpad: 5,
	},
	[ COPY_SITE_FLOW ]: {
		domains: 0,
		'create-site': 1,
		processing: 2,
		'automated-copy': 3,
		'processing-copy': 3,
	},
};

export const useFlowProgress = ( { stepName, flowName, variantSlug }: FlowProgress = {} ) => {
	if ( ! stepName || ! flowName ) {
		return;
	}

	const flow = flows[ variantSlug ?? flowName ];

	return (
		flow && {
			progress: flow[ stepName ],
			count: Math.max( ...Object.values( flow ) ),
		}
	);
};

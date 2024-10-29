import { ECOMMERCE_FLOW, LINK_IN_BIO_TLD_FLOW, FREE_FLOW, COPY_SITE_FLOW } from '../utils/flows';

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
	[ LINK_IN_BIO_TLD_FLOW ]: {
		domains: 0,
		user: 1,
		patterns: 2,
		linkInBioSetup: 3,
		plans: 4,
		launchpad: 5,
	},
	[ FREE_FLOW ]: {
		user: 0,
		freeSetup: 0,
		designSetup: 1,
		launchpad: 2,
	},
	videopress: {
		intro: 0,
		videomakerSetup: 1,
		user: 2,
		options: 3,
		chooseADomain: 4,
		processing: 5,
		launchpad: 6,
	},
	sensei: {
		senseiSetup: 1,
		senseiDomain: 2,
		senseiPlan: 3,
		senseiPurpose: 4,
		senseiLaunch: 5,
	},
	[ ECOMMERCE_FLOW ]: {
		intro: 0,
		storeProfiler: 1,
		designCarousel: 2,
		domains: 3,
		createSite: 4,
		processing: 4,
		waitForAtomic: 4,
		checkPlan: 4,
		storeAddress: 5,
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

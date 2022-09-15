interface FlowProgress {
	stepName?: string;
	flowName?: string;
	userStartedLoggedIn?: boolean;
}

const flows: Record< string, { [ step: string ]: number } > = {
	newsletter: {
		intro: 0,
		user: 1,
		newsletterSetup: 2,
		domains: 3,
		'plans-newsletter': 4,
		subscribers: 5,
		launchpad: 6,
	},
	'newsletter-logged-in': {
		intro: 0,
		newsletterSetup: 1,
		domains: 2,
		'plans-newsletter': 3,
		subscribers: 4,
		launchpad: 5,
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
	'link-in-bio-logged-in': {
		intro: 0,
		patterns: 1,
		linkInBioSetup: 2,
		domains: 3,
		plans: 4,
		launchpad: 5,
	},
};

export const useFlowProgress = ( {
	stepName,
	flowName,
	userStartedLoggedIn,
}: FlowProgress = {} ) => {
	if ( ! stepName || ! flowName ) {
		return;
	}

	const name = userStartedLoggedIn ? `${ flowName }-logged-in` : flowName;
	const flowProgress = flows[ name ];

	return (
		flowProgress && {
			progress: flowProgress[ stepName ],
			count: Object.keys( flowProgress ).length,
		}
	);
};

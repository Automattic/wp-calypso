/* eslint-disable no-restricted-imports */
import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';

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
		'plans-newsletter': 4,
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
};

export const useFlowProgress = ( { stepName, flowName }: FlowProgress = {} ) => {
	const userStartedLoggedIn = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getUserStartedLoggedIn()
	);

	if ( ! stepName || ! flowName ) {
		return;
	}

	const flow = flows[ flowName ];

	return (
		flow && {
			progress: flow[ stepName ] - Number( userStartedLoggedIn ),
			count: Object.keys( flow ).length - Number( userStartedLoggedIn ),
		}
	);
};

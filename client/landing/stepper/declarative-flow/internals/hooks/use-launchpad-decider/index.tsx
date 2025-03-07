import { updateLaunchpadSettings } from '@automattic/data-stores';
import { addQueryArgs } from '@wordpress/url';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';

export const LAUNCHPAD_EXPERIMENT_NAME = 'calypso_onboarding_launchpad_removal_test_2024_08';

interface Props {
	exitFlow: ( path: string ) => void;
	navigate: ( path: string ) => void;
}

interface PostFlowUrlProps {
	flow: string;
	siteId: string | number | null;
	siteSlug: string;
}

interface SiteProps {
	siteId: string | number | null;
	siteSlug: string | null;
}

export const useLaunchpadDecider = ( { exitFlow, navigate }: Props ) => {
	// placeholder field for the experiment assignment
	const showCustomerHome = false;
	const sessionId = getSessionId();
	let launchpadStateOnSkip: null | 'skipped' = null;
	if ( showCustomerHome ) {
		launchpadStateOnSkip = 'skipped';
	}

	const setLaunchpadSkipState = ( siteIdOrSlug: string | number | null ) => {
		if ( siteIdOrSlug && launchpadStateOnSkip ) {
			updateLaunchpadSettings( siteIdOrSlug, { launchpad_screen: launchpadStateOnSkip } );
		}
	};

	return {
		getPostFlowUrl: ( { flow, siteId, siteSlug }: PostFlowUrlProps ) => {
			if ( showCustomerHome ) {
				return `/home/${ siteSlug || siteId }`;
			}

			return addQueryArgs( `/setup/${ flow }/launchpad`, { siteSlug, siteId, sessionId } );
		},
		postFlowNavigator: ( { siteId, siteSlug }: SiteProps ) => {
			if ( showCustomerHome ) {
				setLaunchpadSkipState( siteId || siteSlug );

				exitFlow( '/home/' + siteSlug );
				return;
			}

			navigate( `launchpad?siteSlug=${ siteSlug }&siteId=${ siteId }` );
		},
		initializeLaunchpadState: ( { siteId, siteSlug }: SiteProps ) => {
			if ( showCustomerHome ) {
				setLaunchpadSkipState( siteId || siteSlug );
			}
		},
	};
};

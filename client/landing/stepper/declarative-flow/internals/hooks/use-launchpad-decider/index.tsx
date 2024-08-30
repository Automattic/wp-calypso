import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useExperiment } from 'calypso/lib/explat';

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
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment( LAUNCHPAD_EXPERIMENT_NAME );

	const shouldShowCustomerHome =
		! isLoadingExperiment && 'treatment' === experimentAssignment?.variationName;

	let launchpadStateOnSkip: null | 'skipped' = null;
	if ( shouldShowCustomerHome ) {
		launchpadStateOnSkip = 'skipped';
	}

	const setLaunchpadSkipState = ( siteIdOrSlug: string | number | null ) => {
		if ( siteIdOrSlug && launchpadStateOnSkip ) {
			updateLaunchpadSettings( siteIdOrSlug, { launchpad_screen: launchpadStateOnSkip } );
		}
	};

	return {
		getPostFlowUrl: ( { flow, siteId, siteSlug }: PostFlowUrlProps ) => {
			if ( shouldShowCustomerHome ) {
				return '/home/' + siteSlug;
			}

			if ( siteId ) {
				return `/setup/${ flow }/launchpad?siteSlug=${ siteSlug }&siteId=${ siteId }`;
			}

			return `/setup/${ flow }/launchpad?siteSlug=${ siteSlug }`;
		},
		postFlowNavigator: ( { siteId, siteSlug }: SiteProps ) => {
			if ( shouldShowCustomerHome ) {
				setLaunchpadSkipState( siteId || siteSlug );

				exitFlow( '/home/' + siteSlug );
				return;
			}

			navigate( `launchpad?siteSlug=${ siteSlug }&siteId=${ siteId }` );
			return;
		},
		initializeLaunchpadState: ( { siteId, siteSlug }: SiteProps ) => {
			if ( shouldShowCustomerHome ) {
				setLaunchpadSkipState( siteId || siteSlug );
				return;
			}
		},
	};
};

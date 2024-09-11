import { updateLaunchpadSettings } from '@automattic/data-stores';
import { ExperimentAssignment } from '@automattic/explat-client';
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
		! isLoadingExperiment &&
		( 'treatment' === experimentAssignment?.variationName ||
			// for testing/development purposes we can use sessionStorage to force the treatment
			'treatment' ===
				window.sessionStorage.getItem( 'launchpad_removal_2024_experiment_variation' ) );

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

/**
 * Get the launchpad state based on the experiment assignment
 * @param expLoading
 * @param experimentAssigment
 * @param shouldSkip
 */
export const getLaunchpadStateBasedOnExperiment = (
	expLoading: boolean,
	experimentAssigment: ExperimentAssignment | null,
	shouldSkip: boolean
) => {
	if (
		expLoading ||
		! experimentAssigment?.variationName ||
		experimentAssigment.variationName === 'control'
	) {
		if ( shouldSkip ) {
			return 'skipped';
		}

		return 'full';
	}

	if ( experimentAssigment.variationName === 'treatment' ) {
		return 'skipped';
	}
};

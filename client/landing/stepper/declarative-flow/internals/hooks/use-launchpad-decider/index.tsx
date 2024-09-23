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
	const showCustomerHome = shouldShowCustomerHome( isLoadingExperiment, experimentAssignment );

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
				return '/home/' + siteSlug;
			}

			if ( siteId ) {
				return `/setup/${ flow }/launchpad?siteSlug=${ siteSlug }&siteId=${ siteId }`;
			}

			return `/setup/${ flow }/launchpad?siteSlug=${ siteSlug }`;
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

/**
 * Determine if the customer home should be shown
 * @param isLoadingExperiment
 * @param experimentAssignment
 */
export function shouldShowCustomerHome(
	isLoadingExperiment: boolean,
	experimentAssignment: ExperimentAssignment | null
): boolean {
	return ! isLoadingExperiment && 'treatment' === experimentAssignment?.variationName;
}

/**
 * Get the launchpad state based on the experiment assignment
 * @param expLoading
 * @param experimentAssigment
 * @param shouldSkip
 */
export function getLaunchpadStateBasedOnExperiment(
	expLoading: boolean,
	experimentAssigment: ExperimentAssignment | null,
	shouldSkip: boolean
) {
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
}

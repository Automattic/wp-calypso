import {
	type SiteDetails,
	type ChecklistStatuses,
	OnboardSelect,
	useStarterDesignBySlug,
	updateLaunchpadSettings,
	ActiveTheme,
} from '@automattic/data-stores';
import { isBlogOnboardingFlow, isSiteAssemblerFlow, isReadymadeFlow } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { getSite, getSitePlan } from 'calypso/state/sites/selectors';
import { setActiveTheme } from 'calypso/state/themes/actions';
import { launchpadFlowTasks } from './tasks';
import { LaunchpadChecklist, Task } from './types';

export function isDomainUpsellCompleted(
	site: SiteDetails | null,
	checklistStatuses?: ChecklistStatuses
): boolean {
	return ! site?.plan?.is_free || checklistStatuses?.domain_upsell_deferred === true;
}

export const getSiteIdOrSlug = (
	flow: string,
	site: SiteDetails | null,
	siteSlug?: string | null
) => {
	return isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow ) || isReadymadeFlow( flow )
		? { siteId: site?.ID }
		: { siteSlug };
};
// Returns list of tasks/checklist items for a specific flow
export function getArrayOfFilteredTasks(
	tasks: Task[],
	flow: string | null,
	isEmailVerified: boolean
) {
	let currentFlowTasksIds = flow ? launchpadFlowTasks[ flow ] : null;

	if ( isEmailVerified && currentFlowTasksIds ) {
		currentFlowTasksIds = currentFlowTasksIds.filter( ( task ) => task !== 'verify_email' );
	}

	return (
		currentFlowTasksIds &&
		currentFlowTasksIds.reduce( ( accumulator, currentTaskId ) => {
			tasks.find( ( task ) => {
				if ( task.id === currentTaskId ) {
					accumulator.push( task );
				}
			} );
			return accumulator;
		}, [] as Task[] )
	);
}

/*
 * Confirms if final task for a given site_intent is completed.
 * This is used to as a fallback check to determine if the full
 * screen launchpad should be shown or not.
 *
 * @param {LaunchpadChecklist} checklist - The list of tasks for a site's launchpad
 * @param {boolean} isSiteLaunched - The value of a site's is_launched option
 * @returns {boolean} - True if the final task for the given site checklist is completed
 */
export function areLaunchpadTasksCompleted(
	checklist: LaunchpadChecklist | null | undefined,
	isSiteLaunched: boolean
) {
	if ( ! checklist || ! Array.isArray( checklist ) ) {
		return false;
	}

	const lastTask = checklist[ checklist.length - 1 ];

	// If last task is site_launched and if site is launched, return true
	// Else return the status of the last task
	if ( lastTask?.id === 'site_launched' && isSiteLaunched ) {
		return true;
	}

	return lastTask?.completed;
}

export function useMaybeSwitchThemeAndUpdateChecklist(
	checklist: LaunchpadChecklist | null | undefined,
	siteSlug: string | null
): LaunchpadChecklist | null | undefined {
	const site = useSelector( ( state ) => getSite( state, siteSlug ) );
	const { hasPaidDesign, selectedDesign } = useSelect(
		( select ) => ( {
			hasPaidDesign: ( select( ONBOARD_STORE ) as OnboardSelect ).hasPaidDesign(),
			selectedDesign: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		} ),
		[]
	);

	const reduxDispatch = useReduxDispatch();

	const currentSitePlan = useSelector( ( state ) => {
		if ( ! site ) {
			return null;
		}
		return getSitePlan( state, site.ID );
	} );

	const { setDesignOnSite } = useDispatch( SITE_STORE );
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	const { data: defaultDesign } = useStarterDesignBySlug( 'twentytwentyfour' );

	if ( ! hasPaidDesign || ! currentSitePlan?.is_free ) {
		return checklist;
	}

	if ( selectedDesign?.slug === defaultDesign?.slug ) {
		return checklist;
	}

	updateLaunchpadSettings( site?.ID || '', {
		checklist_statuses: { design_completed: false },
	} );

	setDesignOnSite( site?.ID, defaultDesign, {
		styleVariation: defaultDesign?.style_variations?.[ 0 ],
	} ).then( ( theme: ActiveTheme ) => {
		return reduxDispatch( setActiveTheme( site?.ID || -1, theme ) );
	} );

	setSelectedDesign( defaultDesign );

	return ( checklist ?? [] ).map( ( task ) => {
		if ( task.id === 'design_selected' ) {
			return { ...task, completed: false };
		}
		return task;
	} );
}

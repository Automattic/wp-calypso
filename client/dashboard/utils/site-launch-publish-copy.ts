import { useExperiment } from 'calypso/lib/explat';
import { useAppContext } from '../app/context';

/**
 * Registered on the calypso platform. jetpack-mu-wpcom assigns the same experiment on the
 * server for the admin bar button and the launchpad, so a user gets one variation on every surface.
 */
export const SITE_LAUNCH_PUBLISH_COPY_EXPERIMENT = 'calypso_site_launch_publish_copy_202610_v1';

export interface SiteLaunchPublishCopyInput {
	launchStatus: string | boolean | undefined;
	canManageOptions: boolean | undefined;
	isA4ADevSite: boolean | undefined;
	/** False while the surface shows something other than a launch entry point. Defaults to true. */
	isEntryPointShown?: boolean;
}

export interface SiteLaunchPublishCopyResult {
	isLoading: boolean;
	usePublishCopy: boolean;
}

/**
 * Only someone who can launch the site sees a launch entry point, so only they join the experiment.
 * Agencies launch A4A dev sites through their own flow, which keeps its copy.
 */
export function isEligibleForSiteLaunchPublishCopy( {
	launchStatus,
	canManageOptions,
	isA4ADevSite,
	isEntryPointShown = true,
}: SiteLaunchPublishCopyInput ): boolean {
	return (
		isEntryPointShown && launchStatus === 'unlaunched' && !! canManageOptions && ! isA4ADevSite
	);
}

/**
 * Whether the site launch entry points say "Publish" instead of "Launch". Takes plain values
 * rather than a site object so that callers holding either the redux site model or the
 * api-core site model can use it.
 *
 * Call it only where an entry point renders: it assigns the user, and rendering is the exposure.
 * While `isLoading` is true, render neither copy.
 */
export function useSiteLaunchPublishCopy(
	input: SiteLaunchPublishCopyInput
): SiteLaunchPublishCopyResult {
	// Agencies launch through their own flow, so the agency dashboard keeps today's copy.
	const isAgencyDashboard = !! useAppContext().supports.agency;
	const isEligible = ! isAgencyDashboard && isEligibleForSiteLaunchPublishCopy( input );

	// Always call the hook. Keep ineligible users out of the experiment.
	const [ isLoading, experimentAssignment ] = useExperiment( SITE_LAUNCH_PUBLISH_COPY_EXPERIMENT, {
		isEligible,
	} );

	if ( ! isEligible ) {
		return { isLoading: false, usePublishCopy: false };
	}

	return {
		isLoading,
		usePublishCopy: experimentAssignment?.variationName === 'treatment',
	};
}

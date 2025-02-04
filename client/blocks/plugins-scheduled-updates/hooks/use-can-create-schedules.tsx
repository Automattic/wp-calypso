import { useUpdateScheduleCapabilitiesQuery } from 'calypso/data/plugins/use-update-schedules-capabilities-query';

const DEFAULT_FILE_MOD_PERMISSIONS = {
	modify_files: false,
	autoupdate_files: false,
	errors: undefined,
};

interface UseCanCreateSchedulesReturn {
	canCreateSchedules: boolean;
	errors?: { code: string; message: string }[];
	isLoading: boolean;
}

export function useCanCreateSchedules(
	siteSlug: string,
	isEligibleForFeature: boolean
): UseCanCreateSchedulesReturn {
	const { data, isLoading } = useUpdateScheduleCapabilitiesQuery( siteSlug, isEligibleForFeature );
	const {
		modify_files: modifyFiles,
		autoupdate_files: autoUpdateFiles,
		errors,
	} = data || DEFAULT_FILE_MOD_PERMISSIONS;

	// we assume we can create schedules until the API reports back.
	const canCreateSchedules = isLoading ? true : modifyFiles && autoUpdateFiles;

	return { canCreateSchedules, errors, isLoading };
}

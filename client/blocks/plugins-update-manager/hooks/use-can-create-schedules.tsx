import { useSitePluginsQuery } from 'calypso/data/plugins/use-site-plugins-query';

const DEFAULT_FILE_MOD_PERMISSIONS = { modify_files: false, autoupdate_files: false };

export function useCanCreateSchedules( siteSlug: string ) {
	const { data: pluginsData, isFetching } = useSitePluginsQuery( siteSlug );
	const { modify_files: modifyFiles, autoupdate_files: autoUpdateFiles } =
		( pluginsData && pluginsData.file_mod_capabilities ) || DEFAULT_FILE_MOD_PERMISSIONS;

	// we assume we can create schedules until the API reports back.
	return isFetching ? true : modifyFiles && autoUpdateFiles;
}

import { Primitive } from 'utility-types';
import { useExperiment } from 'calypso/lib/explat';
import { addQueryArgs } from 'calypso/lib/url';
import { TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, Primitive >
) => {
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment(
		'calypso_optimized_migration_flow_v2'
	);

	if ( isLoadingExperiment ) {
		return null;
	}

	const path =
		experimentAssignment?.variationName === 'treatment'
			? '/setup/migration'
			: '/setup/hosted-site-migration';

	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			...additionalParameters,
		},
		path
	);
};

import { Primitive } from 'utility-types';
import { useExperiment } from 'calypso/lib/explat';
import { addQueryArgs } from 'calypso/lib/url';
import { TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, Primitive >
) => {
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment( 'EXPERIMENT_NAME_HERE' );

	if ( isLoadingExperiment ) {
		return '#';
	}

	const path =
		experimentAssignment?.variationName === 'treatment'
			? '/setup/hosted-site-migration'
			: '/setup/migration';

	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			...additionalParameters,
		},
		path
	);
};

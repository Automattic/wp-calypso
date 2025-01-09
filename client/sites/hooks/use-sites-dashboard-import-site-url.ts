import { Primitive } from 'utility-types';
import { useExperiment } from 'calypso/lib/explat';
import { addQueryArgs } from 'calypso/lib/url';
import { TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, Primitive >
) => {
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_site_migration_flow_202501_v1'
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

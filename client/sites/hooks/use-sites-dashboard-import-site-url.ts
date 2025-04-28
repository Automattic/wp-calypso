import { Primitive } from 'utility-types';
import { addQueryArgs } from 'calypso/lib/url';
import { TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, Primitive >
) => {
	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			...additionalParameters,
		},
		'/setup/site-migration'
	);
};

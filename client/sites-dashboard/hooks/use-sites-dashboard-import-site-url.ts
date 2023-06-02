import { addQueryArgs } from 'calypso/lib/url';
import { TRACK_SOURCE_NAME } from '../utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, string >
) => {
	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			...additionalParameters,
		},
		'/start/import'
	);
};

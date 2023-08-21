import { Primitive } from 'utility-types';
import { useIsCurrentlyHostingFlow } from 'calypso/landing/stepper/utils/hosting-flow';
import { addQueryArgs } from 'calypso/lib/url';
import { TRACK_SOURCE_NAME } from '../utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, Primitive >
) => {
	const isHostingFlow = useIsCurrentlyHostingFlow();

	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			...additionalParameters,
		},
		isHostingFlow ? '/setup/import-hosted-site' : '/start/import'
	);
};

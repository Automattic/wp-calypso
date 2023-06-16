import { isInHostingFlow } from 'calypso/landing/stepper/utils/is-in-hosting-flow';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { TRACK_SOURCE_NAME } from '../utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, string >
) => {
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const hostingFlow = useSelector( isInHostingFlow );

	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			...additionalParameters,
			'hosting-flow': hostingFlow ? true : null,
		},
		isDevAccount ? '/setup/import-hosted-site' : '/start/import'
	);
};

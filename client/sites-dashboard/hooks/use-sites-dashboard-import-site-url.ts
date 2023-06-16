import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { AppState } from 'calypso/types';
import { TRACK_SOURCE_NAME } from '../utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, string >
) => {
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const isHostingFlow = useSelector(
		( state: AppState ) => getCurrentQueryArguments( state )?.[ 'hosting-flow' ] === 'true'
	);

	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			...additionalParameters,
			'hosting-flow': isHostingFlow ? true : null,
		},
		isDevAccount ? '/setup/import-hosted-site' : '/start/import'
	);
};

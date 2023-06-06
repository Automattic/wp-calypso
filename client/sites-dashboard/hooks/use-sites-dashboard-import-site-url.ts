import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { TRACK_SOURCE_NAME } from '../utils';

export const useSitesDashboardImportSiteUrl = (
	additionalParameters: Record< string, string >
) => {
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			...additionalParameters,
		},
		isDevAccount && isEnabled( 'hosting-onboarding-i2' )
			? '/setup/import-hosted-site'
			: '/start/import'
	);
};

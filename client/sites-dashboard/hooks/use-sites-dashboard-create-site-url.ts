import config from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { Primitive } from 'utility-types';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { TRACK_SOURCE_NAME } from '../utils';

export const useSitesDashboardCreateSiteUrl = (
	additionalParams: Record< string, Primitive > = {}
) => {
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );
	const siteCount = useSelector( getCurrentUserSiteCount );

	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			ref: siteCount === 0 ? 'calypso-nosites' : null,
			...additionalParams,
		},
		// eslint-disable-next-line no-nested-ternary
		isJetpackCloud()
			? config( 'jetpack_connect_url' )
			: isDevAccount
			? '/setup/new-hosted-site'
			: config( 'signup_url' )
	);
};

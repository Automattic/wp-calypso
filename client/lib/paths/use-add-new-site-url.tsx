import config from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { Primitive } from 'utility-types';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import type { AppState } from 'calypso/types';

export const useAddNewSiteUrl = ( queryParameters: Record< string, Primitive > ) => {
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const isInHostingFlow = useSelector(
		( state: AppState ) => getInitialQueryArguments( state )?.[ 'hosting-flow' ] === 'true'
	);

	return addQueryArgs(
		queryParameters,
		// eslint-disable-next-line no-nested-ternary
		isJetpackCloud()
			? config( 'jetpack_connect_url' )
			: isDevAccount || isInHostingFlow
			? '/setup/new-hosted-site'
			: config( 'signup_url' )
	);
};

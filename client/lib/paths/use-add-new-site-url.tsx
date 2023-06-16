import config from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { Primitive } from 'utility-types';
import { isInHostingFlow } from 'calypso/landing/stepper/utils/is-in-hosting-flow';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

export const useAddNewSiteUrl = ( queryParameters: Record< string, Primitive > ) => {
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const hostingFlow = useSelector( isInHostingFlow );

	return addQueryArgs(
		{
			...queryParameters,
			'hosting-flow': hostingFlow ? true : null,
		},
		// eslint-disable-next-line no-nested-ternary
		isJetpackCloud()
			? config( 'jetpack_connect_url' )
			: isDevAccount || hostingFlow
			? '/setup/new-hosted-site'
			: config( 'signup_url' )
	);
};

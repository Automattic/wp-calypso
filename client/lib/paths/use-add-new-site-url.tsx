import config from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { Primitive } from 'utility-types';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { AppState } from 'calypso/types';

interface GetAddNewSiteUrlParameters {
	isHostingFlow: boolean;
	isDevAccount: boolean;
	queryParameters?: Record< string, Primitive >;
}

export const getAddNewSiteUrl = ( {
	isHostingFlow,
	isDevAccount,
	queryParameters,
}: GetAddNewSiteUrlParameters ) => {
	return addQueryArgs(
		{
			...queryParameters,
			'hosting-flow': isHostingFlow ? true : null,
		},
		// eslint-disable-next-line no-nested-ternary
		isJetpackCloud()
			? config( 'jetpack_connect_url' )
			: isDevAccount || isHostingFlow
			? '/setup/new-hosted-site'
			: config( 'signup_url' )
	);
};

export const useAddNewSiteUrl = (
	queryParameters: GetAddNewSiteUrlParameters[ 'queryParameters' ]
) => {
	const isDevAccount =
		useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) ) === true;

	const isHostingFlow = useSelector(
		( state: AppState ) => getCurrentQueryArguments( state )?.[ 'hosting-flow' ] === 'true'
	);

	return getAddNewSiteUrl( { isHostingFlow, isDevAccount, queryParameters } );
};

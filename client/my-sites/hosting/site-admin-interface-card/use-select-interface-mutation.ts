import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { receiveSite, requestSite } from 'calypso/state/sites/actions';

const SET_SITE_INTERFACE_MUTATION_KEY = 'set-site-interface-mutation-key';

interface MutationResponse {
	WPCOM_ADMIN_INTERFACE: 'wp-admin' | 'calypso';
}

interface MutationError {
	code: string;
	message: string;
}

export const useSiteInterfaceMutation = (
	siteId: number,
	options: UseMutationOptions< MutationResponse, MutationError, string > = {}
) => {
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getRawSite( state, siteId ) );
	const queryKey = [ SET_SITE_INTERFACE_MUTATION_KEY, siteId ];
	const mutation = useMutation< MutationResponse, MutationError, string >( {
		mutationFn: async ( value: string ) => {
			return wp.req.post(
				{
					path: `/sites/${ siteId }/hosting/admin-interface`,
					apiNamespace: 'wpcom/v2',
				},
				{
					interface: value,
				}
			);
		},
		mutationKey: queryKey,
		onSuccess: ( ...params ) => {
			options?.onSuccess?.( ...params );
			const [ data ] = params;
			if ( ! data?.WPCOM_ADMIN_INTERFACE || ! site ) {
				throw new Error( 'Invalid response from hosting/admin-interface' );
			}
			const newOptions = {
				...( site.options || {} ),
				wpcom_admin_interface: data.WPCOM_ADMIN_INTERFACE,
			};
			// Apply the new interface option to the site on redux store
			dispatch( receiveSite( { ...site, options: newOptions } ) );
		},
		onMutate: options?.onMutate,
		onError( _err: MutationError, _newActive: string, prevValue: unknown ) {
			// Request site info on failure
			dispatch( requestSite( siteId ) );
			options?.onError?.( _err, _newActive, prevValue );
		},
	} );

	const { mutate } = mutation;

	return {
		setSiteInterface: mutate,
		...mutation,
	};
};

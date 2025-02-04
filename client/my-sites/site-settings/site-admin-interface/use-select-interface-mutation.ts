import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
import { navigate } from 'calypso/lib/navigate';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { receiveSite, requestSite } from 'calypso/state/sites/actions';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';

const SET_SITE_INTERFACE_MUTATION_KEY = 'set-site-interface-mutation-key';
const PERSISTENT_DATA_DELAY = 1200;

interface MutationResponse {
	interface: 'wp-admin' | 'calypso';
}

interface MutationError {
	code: string;
	message: string;
}

interface UseSiteInterfaceMutationOptions
	extends UseMutationOptions< MutationResponse, MutationError, string > {
	onSuccess?: () => void;
}

function waitMs( ms: number ) {
	return new Promise( ( resolve ) => {
		setTimeout( () => {
			resolve( null );
		}, ms );
	} );
}

export const useSiteInterfaceMutation = (
	siteId: number,
	options: UseSiteInterfaceMutationOptions = {}
) => {
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getRawSite( state, siteId ) );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, site?.ID ) );
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const [ hasSuccessfullyFinished, setHasSuccessfullyFinished ] = useState( false );
	useEffect( () => {
		if ( hasSuccessfullyFinished && ! isRequestingMenu ) {
			setHasSuccessfullyFinished( false );
			options?.onSuccess?.();
		}
	}, [ hasSuccessfullyFinished, isRequestingMenu, options ] );
	const queryKey = [ SET_SITE_INTERFACE_MUTATION_KEY, siteId ];

	const mutation = useMutation< MutationResponse, MutationError, string >( {
		mutationFn: async ( value: string ) => {
			const response = await wp.req.post(
				{
					path: `/sites/${ siteId }/hosting/admin-interface`,
					apiNamespace: 'wpcom/v2',
				},
				{
					interface: value,
				}
			);
			// Wait for persistent data to be updated on the atomic server
			await waitMs( PERSISTENT_DATA_DELAY );
			return response;
		},
		mutationKey: queryKey,
		onSuccess: ( ...params ) => {
			const [ data ] = params;
			if ( ! data?.interface || ! site ) {
				throw new Error( 'Invalid response from hosting/admin-interface' );
			}

			const newOptions = {
				...( site.options || {} ),
				wpcom_admin_interface: data.interface,
			};
			// Apply the new interface option to the site on redux store
			dispatch( receiveSite( { ...site, options: newOptions } ) );

			if ( data.interface === 'wp-admin' && siteAdminUrl ) {
				navigate( addQueryArgs( siteAdminUrl, { 'admin-interface-changed': true } ) );
			} else {
				dispatch( requestAdminMenu( siteId ) );
				setHasSuccessfullyFinished( true );
			}
		},
		onMutate: options?.onMutate,
		onError( _err: MutationError, _newActive: string, prevValue: unknown ) {
			// Request site info on failure
			dispatch( requestSite( siteId ) );
			dispatch( requestAdminMenu( siteId ) );
			options?.onError?.( _err, _newActive, prevValue );
		},
	} );

	const { mutate } = mutation;

	return {
		...mutation,
		setSiteInterface: mutate,
		isLoading: mutation.isPending || isRequestingMenu,
	};
};

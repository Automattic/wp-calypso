import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSelector, useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Firewall } from './types';

const QUERY_WAF_KEY = 'waf';

export function useWafQuery() {
	const siteId = useSelector( getSelectedSiteId );
	return useQuery( {
		queryKey: [ QUERY_WAF_KEY, siteId ],
		queryFn: async () => {
			// Fetch the WAF settings from the site's REST API.
			const res = await wpcom.req.get( {
				apiVersion: '1.1',
				path: `/jetpack-blogs/${ siteId }/rest-api/?path=/jetpack/v4/waf/&json=true`,
			} );
			return res.data;
		},
	} );
}

export function useWafMutation() {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const siteId = useSelector( getSelectedSiteId );

	const getCustomErrorMessage = useCallback( ( error: { code: string } ) => {
		switch ( error.code ) {
			case 'file_system_error':
				return translate( 'A filesystem error occurred.' );
			case 'rules_api_error':
				return translate( 'An error occurred retrieving the latest firewall rules from Jetpack.' );
			default:
				return translate( 'An error occurred.' );
		}
	}, [] );

	return useMutation( {
		mutationFn: ( config ) => {
			// Update the WAF settings by sending a request to the site's REST API.
			return wpcom.req.post( {
				apiVersion: '1.1',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				body: {
					path: '/jetpack/v4/waf/',
					body: JSON.stringify( config ),
					json: true,
				},
			} );
		},
		onMutate: ( config: Record< string, unknown > ) => {
			// Get the current WAF config.
			const initialValue = queryClient.getQueryData( [ QUERY_WAF_KEY, siteId ] );

			// Optimistically update the WAF config.
			queryClient.setQueryData(
				[ QUERY_WAF_KEY, siteId ],
				( prev: Record< string, unknown > ) => ( { ...prev, ...config } )
			);

			return { initialValue };
		},
		onSuccess: ( response: { data?: Firewall } ) => {
			// Show a success notice.
			dispatch(
				successNotice( translate( 'Changes saved.' ), { duration: 5_000, showDismiss: false } )
			);

			// Update the WAF config with the confirmed server state.
			if ( response?.data ) {
				queryClient.setQueryData( [ QUERY_WAF_KEY, siteId ], response.data );
			}
		},
		onError: ( error: { code: string }, variables, context ) => {
			// Reset the WAF config to its previous state.
			queryClient.setQueryData( [ QUERY_WAF_KEY, siteId ], context?.initialValue );

			// Show an error notice.
			dispatch( errorNotice( getCustomErrorMessage( error ) ) );
		},
	} );
}

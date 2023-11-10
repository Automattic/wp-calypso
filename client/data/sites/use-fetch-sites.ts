import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import {
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_SUCCESS,
	SITES_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { fetchSitesAPI, getSiteParams } from 'calypso/state/sites/actions';

export const useFetchSites = () => {
	const dispatch = useDispatch();

	const siteParams = getSiteParams();

	const { isFetching, isSuccess, isError, data } = useQuery( {
		queryKey: [ 'sites-data', ...Object.values( siteParams ) ],
		queryFn: () => fetchSitesAPI( siteParams ),
	} );

	useEffect( () => {
		if ( isFetching ) {
			dispatch( {
				type: SITES_REQUEST,
			} );
		}
	}, [ dispatch, isFetching ] );

	useEffect( () => {
		if ( isSuccess && data?.sites ) {
			dispatch( {
				type: SITES_RECEIVE,
				sites: data.sites,
			} );
			dispatch( {
				type: SITES_REQUEST_SUCCESS,
			} );
		}
	}, [ dispatch, isSuccess, data ] );

	useEffect( () => {
		if ( isError ) {
			dispatch( {
				type: SITES_REQUEST_FAILURE,
			} );
		}
	}, [ dispatch, isError ] );
};

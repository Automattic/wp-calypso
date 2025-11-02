import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { PaidNewsletterData } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import wp from 'calypso/lib/wp';

export function useSubstackImporterState( siteId: number | undefined ) {
	const [ autoRefetch, setAutoRefetch ] = useState( true );

	const { data, isLoading } = useQuery( {
		enabled: !! siteId,
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'paid-newsletter-importer', siteId, engine ],
		queryFn: (): Promise< PaidNewsletterData > => {
			return wp.req.get(
				{
					path: `/sites/${ siteId }/site-importer/paid-newsletter`,
					apiNamespace: 'wpcom/v2',
				},
				{
					engine: 'substack',
				}
			);
		},
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: true,
		staleTime: 6000, // 10 minutes
		refetchInterval: autoRefetch ? 2000 : false, // every 2 seconds
	} );

	// Automatically refetch the data when importing.
	useEffect( () => {
		if (
			data?.steps?.content?.status === 'importing' ||
			data?.steps?.subscribers?.status === 'importing'
		) {
			setAutoRefetch( true );
		} else {
			setAutoRefetch( false );
		}
	}, [ data?.steps?.content?.status, data?.steps?.subscribers?.status ] );

	const state = useMemo( () => {
		const contentStatus = data?.steps?.content?.status;
		const subscribersStatus = data?.steps?.subscribers?.status;

		return {
			contentStatus,
			subscribersStatus,
		};
	}, [ data, isLoading ] );

	return state;
}

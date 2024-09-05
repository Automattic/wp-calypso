import { keepPreviousData, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

interface PaidNewsletterStep {
	status: string;
	content?: any;
}

interface PaidNewsletterData {
	current_step: string;
	steps: Record< string, PaidNewsletterStep >;
}

const REFRESH_INTERVAL = 2000; // every 2 seconds.

export const usePaidNewsletterQuery = (
	engine: string,
	currentStep: string,
	siteId?: number,
	autoRefresh?: boolean
) => {
	return useQuery( {
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
					engine: engine,
					current_step: currentStep,
				}
			);
		},
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: true,
		staleTime: 6000, // 10 minutes
		refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
	} );
};

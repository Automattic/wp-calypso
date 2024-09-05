import { keepPreviousData, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export type StepId = 'content' | 'subscribers' | 'paid-subscribers' | 'summary';
export type StepStatus = 'initial' | 'skipped' | 'importing' | 'done';

interface PaidNewsletterStep {
	status: StepStatus;
	content?: any;
}

interface PaidNewsletterData {
	current_step: StepId;
	steps: Record< StepId, PaidNewsletterStep >;
}

const REFRESH_INTERVAL = 2000; // every 2 seconds.

export const usePaidNewsletterQuery = (
	engine: string,
	currentStep: StepId,
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

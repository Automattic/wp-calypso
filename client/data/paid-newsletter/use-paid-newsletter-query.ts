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

export const usePaidNewsletterQuery = ( engine: string, currentStep: string, siteId?: number ) => {
	return useQuery( {
		enabled: !! siteId,
		queryKey: [ 'paid-newsletter-importer', siteId, engine, currentStep ],
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
	} );
};

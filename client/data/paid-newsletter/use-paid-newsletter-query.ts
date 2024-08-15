import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const usePaidNewsletterQuery = ( engine: string, currentStep: string, siteId?: number ) => {
	return useQuery( {
		enabled: !! siteId,
		queryKey: [ 'paid-newsletter-importer', siteId, engine, currentStep ],
		queryFn: () => {
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
		refetchOnWindowFocus: true,
		staleTime: 6000, // 1 hour
	} );
};

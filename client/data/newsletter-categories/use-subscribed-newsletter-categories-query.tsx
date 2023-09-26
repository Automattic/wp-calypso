import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useIsLoggedIn, requestWithSubkeyFallback } from 'calypso/lib/request-with-subkey-fallback';
import { NewsletterCategories, NewsletterCategory } from './types';

type NewsletterCategoryQueryProps = {
	siteId: number;
	subscriptionId?: number;
};

type NewsletterCategoryResponse = {
	enabled: boolean;
	newsletter_categories: NewsletterCategory[];
};

export const getSubscribedNewsletterCategoriesKey = (
	siteId?: string | number,
	subscriptionId?: number
) => [ 'subscribed-newsletter-categories', siteId, subscriptionId ];

const convertNewsletterCategoryResponse = (
	response: NewsletterCategoryResponse
): NewsletterCategories => ( {
	enabled: response.enabled,
	newsletterCategories: response.newsletter_categories,
} );

const useSubscribedNewsletterCategories = ( {
	siteId,
	subscriptionId,
}: NewsletterCategoryQueryProps ): UseQueryResult< NewsletterCategories > => {
	const { isLoggedIn } = useIsLoggedIn();

	return useQuery( {
		queryKey: getSubscribedNewsletterCategoriesKey( siteId, subscriptionId ),
		queryFn: () => {
			try {
				return requestWithSubkeyFallback< NewsletterCategoryResponse >(
					isLoggedIn,
					`/sites/${ siteId }/newsletter-categories/subscriptions${
						subscriptionId ? `/${ subscriptionId }` : ''
					}`
				).then( convertNewsletterCategoryResponse );
			} catch ( e ) {}
		},
		enabled: !! siteId,
	} );
};

export default useSubscribedNewsletterCategories;

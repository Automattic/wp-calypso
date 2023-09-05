import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { NewsletterCategories, NewsletterCategory } from './types';

type NewsletterCategoryQueryProps = {
	siteId: number;
	subscriptionId?: number;
};

type NewsletterCategoryResponse = {
	enabled: boolean;
	newsletter_categories: NewsletterCategory[];
};

export const getSubscriberNewsletterCategoriesKey = (
	siteId?: string | number,
	subscriptionId?: number
) => [ `newsletter-categories`, siteId, subscriptionId ];

const convertNewsletterCategoryResponse = (
	response: NewsletterCategoryResponse
): NewsletterCategories => ( {
	enabled: response.enabled,
	newsletterCategories: response.newsletter_categories,
} );

const useSubscriberNewsletterCategories = ( {
	siteId,
	subscriptionId,
}: NewsletterCategoryQueryProps ): UseQueryResult< NewsletterCategories > => {
	return useQuery( {
		queryKey: getSubscriberNewsletterCategoriesKey( siteId, subscriptionId ),
		queryFn: () =>
			request< NewsletterCategoryResponse >( {
				path: `/sites/${ siteId }/newsletter-categories/subscriptions${
					subscriptionId ? `/${ subscriptionId }` : ''
				}`,
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} ).then( convertNewsletterCategoryResponse ),
		enabled: !! siteId,
	} );
};

export default useSubscriberNewsletterCategories;

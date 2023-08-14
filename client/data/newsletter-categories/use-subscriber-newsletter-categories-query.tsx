import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { NewsletterCategories, NewsletterCategory } from './types';

type NewsletterCategoryQueryProps = {
	siteId: number;
};

type NewsletterCategoryResponse = {
	newsletter_categories: NewsletterCategory[];
};

export const getSubscriberNewsletterCategoriesKey = ( siteId?: string | number ) => [
	`newsletter-categories`,
	siteId,
];

const convertNewsletterCategoryResponse = (
	response: NewsletterCategoryResponse
): NewsletterCategories => {
	return { newsletterCategories: response.newsletter_categories };
};

const useSubscriberNewsletterCategories = ( {
	siteId,
}: NewsletterCategoryQueryProps ): UseQueryResult< NewsletterCategories > => {
	return useQuery( {
		queryKey: getSubscriberNewsletterCategoriesKey( siteId ),
		queryFn: () =>
			request< NewsletterCategoryResponse >( {
				path: `/sites/${ siteId }/newsletter-categories/subscriptions`,
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} ).then( convertNewsletterCategoryResponse ),
		enabled: !! siteId,
	} );
};

export default useSubscriberNewsletterCategories;

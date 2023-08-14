import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { NewsletterCategories, NewsletterCategory } from './types';

type NewsletterCategoryQueryProps = {
	siteId?: string | number;
};

type NewsletterCategoryResponse = {
	newsletter_categories: NewsletterCategory[];
};

const convertNewsletterCategoryResponse = (
	response: NewsletterCategoryResponse
): NewsletterCategories => {
	return { newsletterCategories: response.newsletter_categories };
};

export const getNewsletterCategoriesKey = ( siteId?: string | number ) => [
	`newsletter-categories`,
	siteId,
];

const useNewsletterCategories = ( {
	siteId,
}: NewsletterCategoryQueryProps ): UseQueryResult< NewsletterCategories > => {
	return useQuery( {
		queryKey: getNewsletterCategoriesKey( siteId ),
		queryFn: () =>
			request< NewsletterCategoryResponse >( {
				path: `/sites/${ siteId }/newsletter-categories`,
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} ).then( convertNewsletterCategoryResponse ),
		enabled: !! siteId,
	} );
};

export default useNewsletterCategories;

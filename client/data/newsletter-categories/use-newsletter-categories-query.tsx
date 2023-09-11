import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { NewsletterCategories, NewsletterCategoriesResponse } from './types';

type NewsletterCategoryQueryProps = {
	siteId?: string | number;
};

export const convertNewsletterCategoriesResponse = (
	response: NewsletterCategoriesResponse
): NewsletterCategories => {
	return {
		enabled: response.enabled,
		newsletterCategories: response.newsletter_categories,
	};
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
			request< NewsletterCategoriesResponse >( {
				path: `/sites/${ siteId }/newsletter-categories`,
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} ).then( convertNewsletterCategoriesResponse ),
		enabled: !! siteId,
	} );
};

export default useNewsletterCategories;

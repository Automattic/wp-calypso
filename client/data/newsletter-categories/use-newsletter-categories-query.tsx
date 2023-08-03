import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { NewsletterCategories, NewsletterCategory } from './types';

type NewsletterCategoryQueryProps = {
	blogId?: number;
};

type NewsletterCategoryResponse = {
	newsletter_categories: NewsletterCategory[];
};

const convertNewsletterCategoryResponse = (
	response: NewsletterCategoryResponse
): NewsletterCategories => {
	return { newsletterCategories: response.newsletter_categories };
};

const useNewsletterCategories = ( {
	blogId,
}: NewsletterCategoryQueryProps ): UseQueryResult< NewsletterCategories > => {
	return useQuery( {
		queryKey: [ `newsletter-categories-${ blogId }` ],
		queryFn: () =>
			request< NewsletterCategoryResponse >( {
				path: `/sites/${ blogId }/newsletter-categories`,
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} ).then( convertNewsletterCategoryResponse ),
		enabled: !! blogId,
	} );
};

export default useNewsletterCategories;

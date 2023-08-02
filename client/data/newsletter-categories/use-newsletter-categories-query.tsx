import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import {
	NewsletterCategories,
	NewsletterCategoryQueryProps,
	NewsletterCategoryResponse,
} from './types';

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
				path: `/sites/${ blogId }/newsletter-categories?http_envelope=1`,
				apiVersion: '2',
			} ).then( convertNewsletterCategoryResponse ),
	} );
};

export default useNewsletterCategories;

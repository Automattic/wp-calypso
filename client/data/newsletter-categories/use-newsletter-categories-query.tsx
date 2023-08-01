import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';

type NewsletterCategoryQueryProps = {
	blogId: number;
};

type NewsletterCategoryQueryResponse = {
	newsletter_categories: NewsletterCategoryResponse[];
};

type NewsletterCategories = {
	newsletterCategories: NewsletterCategory[];
};

type NewsletterCategoryResponse = {
	term_id: number;
	name: string;
	description: string;
	order: number;
};

type NewsletterCategory = {
	termId: number;
	name: string;
	description: string;
	order: number;
};

const convertNewsletterCategoryResponse = ( response: NewsletterCategoryQueryResponse ) => {
	return {
		newsletterCategories: response.newsletter_categories.map(
			( { term_id, name, description, order }: NewsletterCategoryResponse ) => {
				return {
					termId: term_id,
					name,
					description,
					order,
				};
			}
		),
	};
};

const useNewsletterCategories = ( {
	blogId,
}: NewsletterCategoryQueryProps ): UseQueryResult< NewsletterCategories > => {
	return useQuery( {
		queryKey: [ `newsletter-categories-${ blogId }` ],
		queryFn: () =>
			request< NewsletterCategoryQueryResponse >( {
				path: `/sites/${ blogId }/newsletter-categories?http_envelope=1`,
				apiVersion: '2',
			} ).then( convertNewsletterCategoryResponse ),
	} );
};

export default useNewsletterCategories;

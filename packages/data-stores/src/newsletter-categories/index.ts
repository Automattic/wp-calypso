import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';

export type NewsletterCategory = {
	id: number;
	name: string;
	slug: string;
	description: string;
	parent: number;
	subscribed?: boolean;
};

export type NewsletterCategories = {
	enabled: boolean;
	newsletterCategories: NewsletterCategory[];
	error?: string;
};

type NewsletterCategoryResponse = {
	enabled: boolean;
	newsletter_categories: NewsletterCategory[];
};

/**
 * React hook to fetch newsletter categories for a site.
 */
export const useNewsletterCategories = ( {
	siteId,
}: {
	siteId?: string | number;
} ): UseQueryResult< NewsletterCategories > => {
	return useQuery( {
		queryKey: [ 'newsletter-categories', siteId ] as const, // Make tuple readonly for better caching.
		queryFn: async () => {
			try {
				const response = await request< NewsletterCategoryResponse >( {
					path: `/sites/${ siteId }/newsletter-categories`,
					apiNamespace: 'wpcom/v2',
				} );
				return {
					enabled: response.enabled,
					newsletterCategories: response.newsletter_categories,
				};
			} catch ( e ) {
				return {
					enabled: false,
					newsletterCategories: [],
					error: e instanceof Error ? e.message : 'Unknown error',
				};
			}
		},
		enabled: Boolean( siteId ),
	} );
};

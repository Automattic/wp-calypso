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
 * Key generator for newsletter categories cache.
 */
export const getNewsletterCategoriesKey = ( siteId?: string | number ) =>
	[ 'newsletter-categories', siteId ] as const; // Make tuple readonly for better caching

/**
 * Converts API response to correct data structure.
 */
const convertResponse = ( response: NewsletterCategoryResponse ): NewsletterCategories => ( {
	enabled: response.enabled,
	newsletterCategories: response.newsletter_categories,
} );

/**
 * React hook to fetch newsletter categories for a site.
 */
export const useNewsletterCategories = ( {
	siteId,
}: {
	siteId?: string | number;
} ): UseQueryResult< NewsletterCategories > => {
	return useQuery( {
		queryKey: getNewsletterCategoriesKey( siteId ),
		queryFn: async () => {
			try {
				const response = await request< NewsletterCategoryResponse >( {
					path: `/sites/${ siteId }/newsletter-categories`,
					apiVersion: '2',
					apiNamespace: 'wpcom/v2',
				} );
				return convertResponse( response );
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

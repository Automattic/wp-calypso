import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { NewsletterCategories, NewsletterCategory } from './types';

type NewsletterCategoryQueryProps = {
	siteId: number;
	subscriptionId?: number;
	userId?: number;
	enabled?: boolean;
};

type NewsletterCategoryResponse = {
	enabled: boolean;
	newsletter_categories: NewsletterCategory[];
};

export const getSubscribedNewsletterCategoriesKey = (
	siteId?: string | number,
	subscriptionId?: number,
	userId?: number,
	enabled?: boolean
) => [ 'subscribed-newsletter-categories', siteId, subscriptionId, userId, enabled ];

const convertNewsletterCategoryResponse = (
	response: NewsletterCategoryResponse
): NewsletterCategories => ( {
	enabled: response.enabled,
	newsletterCategories: response.newsletter_categories,
} );

const useSubscribedNewsletterCategories = ( {
	siteId,
	subscriptionId,
	userId,
	enabled = true,
}: NewsletterCategoryQueryProps ): UseQueryResult< NewsletterCategories > => {
	let path = `/sites/${ siteId }/newsletter-categories/subscriptions`;
	if ( userId ) {
		path += `/${ userId }?type=wpcom`;
	} else if ( subscriptionId ) {
		path += `/${ subscriptionId }`;
	}

	return useQuery( {
		queryKey: getSubscribedNewsletterCategoriesKey( siteId, subscriptionId, userId ),
		queryFn: async () => {
			try {
				const response = await wpcom.req.get< NewsletterCategoryResponse >( {
					path,
					apiNamespace: 'wpcom/v2',
				} );
				return convertNewsletterCategoryResponse( response );
			} catch ( e ) {
				return {
					enabled: false,
					newsletterCategories: [],
					error: e instanceof Error ? e.message : 'Unknown error',
				};
			}
		},
		enabled: !! siteId && enabled,
	} );
};

export default useSubscribedNewsletterCategories;

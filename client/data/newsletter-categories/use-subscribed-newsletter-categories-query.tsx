import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useIsLoggedIn, requestWithSubkeyFallback } from 'calypso/lib/request-with-subkey-fallback';
import { NewsletterCategories, NewsletterCategory } from './types';

type NewsletterCategoryQueryProps = {
	siteId: number;
	subscriptionId?: number;
	userId?: number;
};

type NewsletterCategoryResponse = {
	enabled: boolean;
	newsletter_categories: NewsletterCategory[];
};

export const getSubscribedNewsletterCategoriesKey = (
	siteId?: string | number,
	subscriptionId?: number,
	userId?: number
) => [ 'subscribed-newsletter-categories', siteId, subscriptionId, userId ];

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
}: NewsletterCategoryQueryProps ): UseQueryResult< NewsletterCategories > => {
	const { isLoggedIn } = useIsLoggedIn();

	let path = `/sites/${ siteId }/newsletter-categories/subscriptions`;
	if ( userId ) {
		path += `/${ userId }?type=wpcom`;
	} else if ( subscriptionId ) {
		path += `/${ subscriptionId }`;
	}

	return useQuery( {
		queryKey: getSubscribedNewsletterCategoriesKey( siteId, subscriptionId, userId ),
		queryFn: () => {
			try {
				return requestWithSubkeyFallback< NewsletterCategoryResponse >( isLoggedIn, path ).then(
					convertNewsletterCategoryResponse
				);
			} catch ( e ) {}
		},
		enabled: !! siteId,
	} );
};

export default useSubscribedNewsletterCategories;

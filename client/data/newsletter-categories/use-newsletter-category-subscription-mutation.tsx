import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsLoggedIn, requestWithSubkeyFallback } from 'calypso/lib/request-with-subkey-fallback';
import { NewsletterCategories, NewsletterCategoriesResponse } from './types';
import { getSubscribedNewsletterCategoriesKey } from './use-subscribed-newsletter-categories-query';

type NewsletterCategorySubscription = {
	term_id: number;
	subscribe: boolean;
};

const useNewsletterCategorySubscriptionMutation = ( siteId: string | number ) => {
	const queryClient = useQueryClient();
	const subscribedCategoriesCacheKey = getSubscribedNewsletterCategoriesKey( siteId );
	const { isLoggedIn } = useIsLoggedIn();

	return useMutation( {
		mutationFn: async ( categorySubscriptions: NewsletterCategorySubscription[] ) => {
			return await requestWithSubkeyFallback< NewsletterCategoriesResponse >(
				isLoggedIn,
				`/sites/${ siteId }/newsletter-categories/subscriptions`,
				'POST',
				{ categories: categorySubscriptions }
			);
		},
		onMutate: async ( categorySubscriptions: NewsletterCategorySubscription[] ) => {
			await queryClient.cancelQueries( { queryKey: subscribedCategoriesCacheKey } );

			const previousData = queryClient.getQueryData< NewsletterCategories >(
				subscribedCategoriesCacheKey
			);

			queryClient.setQueryData(
				subscribedCategoriesCacheKey,
				( oldData?: NewsletterCategories ) => {
					const newSubscribedCategories =
						previousData?.newsletterCategories.map( ( category ) => {
							const categorySubscription = categorySubscriptions.find(
								( subscription ) => subscription.term_id === category.id
							);

							if ( ! categorySubscription ) {
								return category;
							}

							return {
								...category,
								subscribed: categorySubscription.subscribe,
							};
						} ) || [];

					const updatedData = {
						...oldData,
						enabled: oldData?.enabled || false,
						newsletterCategories: newSubscribedCategories,
					};

					return updatedData;
				}
			);

			return { previousData };
		},
		onError: ( error, variables, context ) => {
			queryClient.setQueryData( subscribedCategoriesCacheKey, context?.previousData );
		},
		onSettled: async () => {
			await queryClient.invalidateQueries( { queryKey: subscribedCategoriesCacheKey } );
		},
	} );
};

export default useNewsletterCategorySubscriptionMutation;

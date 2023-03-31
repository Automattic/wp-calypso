import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';

type SiteSubscriptionUnfollowParams = {
	blog_id: number | string;
};

type SiteSubscriptionUnfollowResponse = {
	success: boolean;
	subscribed: boolean;
	subscription: null;
};

const useSiteUnfollowMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	return useMutation(
		async ( params: SiteSubscriptionUnfollowParams ) => {
			if ( ! params.blog_id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			const response = await callApi< SiteSubscriptionUnfollowResponse >( {
				path: `/read/site/${ params.blog_id }/post_email_subscriptions/delete`,
				method: 'POST',
				isLoggedIn,
				apiVersion: '1.2',
			} );
			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			return response;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries( [ 'read', 'site-subscriptions', isLoggedIn ] );
				queryClient.invalidateQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );
			},
		}
	);
};

export default useSiteUnfollowMutation;

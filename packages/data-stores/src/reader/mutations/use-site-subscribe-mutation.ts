import { useMutation } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';

type SubscribeParams = {
	blog_id: number | string;
};

type SubscribeResponse = {
	success?: boolean;
	subscribed?: boolean;
	subscription?: {
		blog_ID: string;
		delivery_frequency: string;
		status: string;
		ts: string;
	};
};

const useSiteSubscribeMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();

	return useMutation( async ( params: SubscribeParams ) => {
		if ( ! params.blog_id ) {
			throw new Error(
				// reminder: translate this string when we add it to the UI
				'Something went wrong while subscribing.'
			);
		}

		const response = await callApi< SubscribeResponse >( {
			path: `/read/site/${ params.blog_id }/post_email_subscriptions/new`,
			method: 'POST',
			isLoggedIn,
			apiVersion: '1.2',
			body: {},
		} );
		if ( ! response.success ) {
			throw new Error(
				// reminder: translate this string when we add it to the UI
				'Something went wrong while subscribing.'
			);
		}

		return response;
	} );
};

export default useSiteSubscribeMutation;

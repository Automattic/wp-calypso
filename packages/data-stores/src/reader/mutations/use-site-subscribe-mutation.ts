import { useMutation } from '@tanstack/react-query';
import { callApi, getSubscriptionMutationParams } from '../helpers';
import { useIsLoggedIn } from '../hooks';

type SubscribeParams = {
	blog_id?: number | string;
	url?: string;
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

		const { path, apiVersion, body } = getSubscriptionMutationParams(
			'new',
			isLoggedIn,
			params.blog_id,
			params.url
		);

		const response = await callApi< SubscribeResponse >( {
			path,
			method: 'POST',
			isLoggedIn,
			apiVersion,
			body,
		} );
		if ( ! response.subscribed ) {
			throw new Error(
				// reminder: translate this string when we add it to the UI
				'Something went wrong while subscribing.'
			);
		}

		return response;
	} );
};

export default useSiteSubscribeMutation;

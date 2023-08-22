import { useMutation } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';

type ImportSubscriptionsParams = {
	file: File;
	onSuccess?: () => void;
	onError?: () => void;
};

type ImportSubscriptionsResponse = {
	success?: boolean;
};

const useImportSiteSubscriptionsMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();

	return useMutation( {
		mutationFn: async ( params: ImportSubscriptionsParams ) => {
			const response = await callApi< ImportSubscriptionsResponse >( {
				path: '/read/following/mine/import',
				method: 'POST',
				isLoggedIn,
				apiVersion: '1.2',
				formData: [ [ 'import', params.file, params.file.name ] ],
			} );
			if ( ! response.success ) {
				throw new Error( 'Something went wrong while importing subscriptions.' );
			}

			return response;
		},
		onError: ( _error, params ) => {
			params.onError?.();
		},
		onSuccess: ( data, params ) => {
			params.onSuccess?.();
		},
	} );
};

export default useImportSiteSubscriptionsMutation;

import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface SubmitButtonColorResponse {
	color: string;
}

export const useSubmitButtonColor = (): string => {
	const { data } = useQuery< SubmitButtonColorResponse >( {
		queryKey: [ 'submit-button-color' ],
		queryFn: async () => {
			return await wpcom.req.get( {
				path: '/submit-button-color',
				apiNamespace: 'wpcom/v2',
			} );
		},
	} );
	return data?.color ?? 'red';
};

import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

async function fetchSubmitButtonColor(): Promise< string > {
	return await wpcom.req.get( {
		path: '/submit-button-color',
		apiNamespace: 'wpcom/v2',
	} );
}

export default function useSubmitButtonColor(): string | undefined {
	const result = useQuery( {
		queryKey: [ 'checkout-submit-button-color' ],
		queryFn: fetchSubmitButtonColor,
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
	} );
	return result.data;
}

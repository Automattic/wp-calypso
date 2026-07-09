import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface SubmitButtonColorResponse {
	color: string;
}

async function fetchSubmitButtonColor(): Promise< SubmitButtonColorResponse > {
	return wpcom.req.get( {
		path: '/submit-button-color',
		apiNamespace: 'wpcom/v2',
	} );
}

export default function useSubmitButtonColor(): string | undefined {
	const { data } = useQuery< SubmitButtonColorResponse, Error >( {
		queryKey: [ 'checkout-submit-button-color' ],
		queryFn: fetchSubmitButtonColor,
		refetchOnWindowFocus: false,
		meta: {
			persist: false,
		},
	} );
	return data?.color;
}

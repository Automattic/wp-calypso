import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export default function useAiSuggestionsMutation() {
	return useMutation( {
		mutationFn: async ( params: any ) => {
			const res = await wpcom.req.post( {
				apiNamespace: 'rest/v1',
				path: `/nbi/domain-suggestion?http_envelope=1`,
				method: 'POST',
				body: params,
			} );
			return res;
		},
	} );
}

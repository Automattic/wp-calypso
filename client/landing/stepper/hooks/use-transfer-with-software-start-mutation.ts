import { useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type transferWithSoftwareResponse = {
	transferId: number;
};

const requestTransferWithSoftware: (
	siteId: number,
	plugins: Record< string, 'install' | 'activate' >,
	themes: Record< string, 'install' | 'activate' >
) => Promise< transferWithSoftwareResponse > = async (
	siteId: number,
	plugins: Record< string, 'install' | 'activate' >,
	themes: Record< string, 'install' | 'activate' >
) => {
	const response = await wpcom.req.post(
		{
			path: `/sites/${ siteId }/atomic/transfer-with-software?http_envelope=1`,
		},
		{
			apiNamespace: 'wpcom/v2',
			body: { plugins, themes },
		}
	);
	return response;
};

export const useRequestTransferWithSoftware = (
	siteId?: number,
	plugins?: Record< string, 'install' | 'activate' >,
	themes?: Record< string, 'install' | 'activate' >,
	options?: { retry?: number }
): UseMutationResult< transferWithSoftwareResponse, Error, void > => {
	return useMutation( {
		mutationKey: [ 'transfer-with-software', siteId, plugins, themes ],
		mutationFn: async () => requestTransferWithSoftware( siteId!, plugins!, themes! ),
		retry: options?.retry ?? 3, // Default retry 3 times
		onSuccess: ( data ) => {
			return data?.transferId;
		},
	} );
};

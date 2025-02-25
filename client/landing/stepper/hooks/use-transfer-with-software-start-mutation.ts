import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const requestTransferWithSoftware = async (
	siteId: number,
	plugins: Record< string, 'install' | 'activate' >,
	themes: Record< string, 'install' | 'activate' >
) => {
	const response = await wpcom.req.post(
		{
			path: `/sites/${ siteId }/atomic/transfer-with-software`,
		},
		{
			apiNamespace: 'wpcom/v2',
			body: { plugins, themes },
			http_envelope: 1,
		}
	);
	return response;
};

export const useRequestTransferWithSoftware = (
	siteId?: number,
	plugins?: Record< string, 'install' | 'activate' >,
	themes?: Record< string, 'install' | 'activate' >,
	options?: { retry?: number }
) => {
	return useMutation( {
		mutationKey: [ 'transfer-with-software', siteId, plugins, themes ],
		mutationFn: async () => requestTransferWithSoftware( siteId!, plugins!, themes! ),
		retry: options?.retry ?? 3, // Default retry 3 times
	} );
};

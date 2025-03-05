import { useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type transferWithSoftwareResponse = {
	transferId: number;
};

type SoftwareSlug = string;
type SoftwareStatus = 'install' | 'activate';
type Software = Record< SoftwareSlug, SoftwareStatus >;

type transferOptions = {
	siteId: number;
	from?: string;
	plugins?: Software;
	themes?: Software;
};

const requestTransferWithSoftware: (
	transferOptions: transferOptions
) => Promise< transferWithSoftwareResponse > = async ( { siteId, from, plugins, themes } ) => {
	const response = await wpcom.req.post(
		{
			path: `/sites/${ siteId }/atomic/transfer-with-software?http_envelope=1`,
		},
		{
			apiNamespace: 'wpcom/v2',
			body: { plugins, themes, settings: { migration_source_site_domain: from } },
		}
	);

	if ( ! response ) {
		throw new Error( 'Transfer with software failed' );
	}

	return response;
};

export const useRequestTransferWithSoftware = (
	transferOptions: transferOptions,
	queryOptions?: { retry?: number }
): UseMutationResult< transferWithSoftwareResponse, Error, void > => {
	return useMutation( {
		mutationKey: [
			'transfer-with-software',
			transferOptions.siteId,
			transferOptions.from,
			transferOptions.plugins,
			transferOptions.themes,
		],
		mutationFn: async () => {
			if ( ! transferOptions.siteId ) {
				throw new Error( 'Site ID is required' );
			}
			return requestTransferWithSoftware( {
				siteId: transferOptions.siteId,
				from: transferOptions.from,
				plugins: transferOptions.plugins,
				themes: transferOptions.themes,
			} );
		},
		retry: queryOptions?.retry ?? 3, // Default retry 3 times
	} );
};

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type transferWithSoftwareResponse = {
	transferId: number;
};

type transferOptions = {
	siteId: number;
	from?: string;
	plugins?: Record< string, 'install' | 'activate' >;
	themes?: Record< string, 'install' | 'activate' >;
};

type SoftwareSlug = string;
type SoftwareStatus = 'install' | 'activate';
type Software = Record< SoftwareSlug, SoftwareStatus >;

const requestTransferWithSoftware: (
	options: transferOptions
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
	siteId?: number,
	from?: string,
	plugins?: Software,
	themes?: Software,
	options?: { retry?: number }
): UseMutationResult< transferWithSoftwareResponse, Error, void > => {
	return useMutation( {
		mutationKey: [ 'transfer-with-software', siteId, from, plugins, themes ],
		mutationFn: async () => {
			if ( ! siteId ) {
				throw new Error( 'Site ID is required' );
			}
			return requestTransferWithSoftware( { siteId, from, plugins, themes } );
		},
		retry: options?.retry ?? 3, // Default retry 3 times
	} );
};

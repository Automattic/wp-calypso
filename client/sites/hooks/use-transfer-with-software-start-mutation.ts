import { useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type TransferWithSoftwareResponse = {
	blog_id: number;
	transfer_id: number;
	transfer_status: string;
};

type ApiSettings = Record< string, unknown >;

type TransferOptions = {
	siteId: number;
	apiSettings?: ApiSettings;
	plugin_slug?: string;
	theme_slug?: string;
};

const requestTransferWithSoftware: (
	transferOptions: TransferOptions
) => Promise< TransferWithSoftwareResponse > = async ( {
	siteId,
	apiSettings,
	plugin_slug,
	theme_slug,
} ) => {
	const response = await wpcom.req.post( {
		path: `/sites/${ siteId }/atomic/transfer-with-software?http_envelope=1`,
		apiNamespace: 'wpcom/v2',
		body: {
			plugin_slug: plugin_slug,
			theme_slug: theme_slug,
			settings: { ...apiSettings },
		},
	} );

	if ( ! response ) {
		throw new Error( 'Transfer with software failed' );
	}

	return response;
};

export const useRequestTransferWithSoftware = (
	transferOptions: TransferOptions,
	queryOptions?: {
		retry?: number;
		onSuccess?: ( data: TransferWithSoftwareResponse ) => void;
		onError?: ( error: Error ) => void;
	}
): UseMutationResult< TransferWithSoftwareResponse, Error, void > => {
	return useMutation( {
		mutationKey: [
			'transfer-with-software',
			transferOptions.siteId,
			transferOptions.apiSettings,
			transferOptions.plugin_slug,
			transferOptions.theme_slug,
		],
		mutationFn: async () => {
			if ( ! transferOptions.siteId ) {
				throw new Error( 'Site ID is required' );
			}
			return requestTransferWithSoftware( {
				siteId: transferOptions.siteId,
				apiSettings: transferOptions.apiSettings,
				plugin_slug: transferOptions.plugin_slug,
				theme_slug: transferOptions.theme_slug,
			} );
		},
		retry: queryOptions?.retry ?? 3, // Default retry 3 times
		onSuccess: queryOptions?.onSuccess,
		onError: queryOptions?.onError,
	} );
};

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type TransferWithSoftwareResponse = {
	transferId: number;
};

export type SoftwareSlug = string;
export type SoftwareStatus = 'install' | 'activate';
export type Software = Record<SoftwareSlug, SoftwareStatus>;
export type ApiSettings = Record<string, unknown>;

export type TransferOptions = {
	siteId: number;
	apiSettings?: ApiSettings;
	plugins?: Software;
	themes?: Software;
};

const requestTransferWithSoftware: (
	transferOptions: TransferOptions
) => Promise<TransferWithSoftwareResponse> = async ({ siteId, apiSettings, plugins, themes }) => {
	const response = await wpcom.req.post(
		{
			path: `/sites/${siteId}/atomic/transfer-with-software?http_envelope=1`,
		},
		{
			apiNamespace: 'wpcom/v2',
			body: { plugins, themes, settings: { ...apiSettings } },
		}
	);

	if (!response) {
		throw new Error('Transfer with software failed');
	}

	return response;
};

export const useRequestTransferWithSoftware = (
	transferOptions: TransferOptions,
	queryOptions?: {
		retry?: number;
		onSuccess?: (data: TransferWithSoftwareResponse) => void;
		onError?: (error: Error) => void;
	}
): UseMutationResult<TransferWithSoftwareResponse, Error, void> => {
	return useMutation({
		mutationKey: [
			'transfer-with-software',
			transferOptions.siteId,
			transferOptions.apiSettings,
			transferOptions.plugins,
			transferOptions.themes,
		],
		mutationFn: async () => {
			if (!transferOptions.siteId) {
				throw new Error('Site ID is required');
			}
			return requestTransferWithSoftware({
				siteId: transferOptions.siteId,
				apiSettings: transferOptions.apiSettings,
				plugins: transferOptions.plugins,
				themes: transferOptions.themes,
			});
		},
		retry: queryOptions?.retry ?? 3, // Default retry 3 times
		onSuccess: queryOptions?.onSuccess,
		onError: queryOptions?.onError,
	});
};

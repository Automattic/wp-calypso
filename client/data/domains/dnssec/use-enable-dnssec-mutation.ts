import { useMutation } from '@tanstack/react-query';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';

type Dnskey = {
	algorithm: number;
	flags: number;
	protocol: number;
	public_key: string;
	rdata: string;
};

type DsData = {
	algorithm: number;
	digest: string;
	digest_type: number;
	key_tag: number;
	rdata: string;
};

type EnableDnssecSuccessResponse = {
	data: {
		cryptokeys: Array< {
			dnskey?: Dnskey;
			ds_data?: Array< DsData >;
		} >;
		dnssec_data_set_at_registry: boolean;
	};
};

export default function useEnableDnssecMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: ( success: EnableDnssecSuccessResponse ) => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const mutation = useMutation( {
		mutationFn: () => {
			return wp.req.post( {
				path: `/domains/dnssec/${ domainName }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		...queryOptions,
	} );

	return { enableDnssec: mutation.mutate, ...mutation };
}

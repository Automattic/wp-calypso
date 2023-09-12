import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';

type ContactInfo = {
	address1: string;
	address2: string;
	city: string;
	countryCode: string;
	email: string;
	fax: string;
	firstName: string;
	lastName: string;
	organization: string;
	phone: string;
	postalCode: string;
	state: string;
};

type ReceiveTransferInfo = {
	contactInfo: ContactInfo;
	termsAccepted: boolean;
};

export default function useDomainTransferReceive(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const mutation = useMutation( {
		mutationFn: ( transferInfo: ReceiveTransferInfo ) =>
			wp.req.post( `/sites/all/domains/${ domainName }/receive-transfer`, {
				transferInfo,
			} ),
		...queryOptions,
		onSuccess() {
			queryOptions.onSuccess?.();
		},
	} );

	const { mutate } = mutation;

	const domainTransferReceive = useCallback(
		( transferInfo: ReceiveTransferInfo ) => mutate( transferInfo ),
		[ mutate ]
	);

	return { domainTransferReceive, ...mutation };
}

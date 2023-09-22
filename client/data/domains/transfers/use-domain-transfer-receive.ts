import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';

export type TransferInfo = {
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
	termsAccepted: boolean;
};

export type DomainsReceiveTransferResponse = {
	success: boolean;
	domain: string;
};

export function useDomainTransferReceive(
	domainName: string,
	queryOptions: {
		onSuccess?: ( data: DomainsReceiveTransferResponse ) => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const mutation = useMutation( {
		mutationFn: ( info: TransferInfo ) =>
			wp.req.post( `/sites/all/domains/${ domainName }/receive-transfer`, {
				address1: info.address1,
				address2: info.address2,
				city: info.city,
				country_code: info.countryCode,
				email: info.email,
				fax: info.fax,
				first_name: info.firstName,
				last_name: info.lastName,
				organization: info.organization,
				phone: info.phone,
				postal_code: info.postalCode,
				state: info.state,
				terms_accepted: info.termsAccepted,
			} ),
		...queryOptions,
		onSuccess( data: DomainsReceiveTransferResponse ) {
			queryOptions.onSuccess?.( data );
		},
	} );

	const { mutate } = mutation;

	const domainTransferReceive = useCallback(
		( transferInfo: TransferInfo ) => mutate( transferInfo ),
		[ mutate ]
	);

	return { domainTransferReceive, ...mutation };
}

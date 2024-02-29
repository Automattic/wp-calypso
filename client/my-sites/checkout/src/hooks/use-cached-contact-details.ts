import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type {
	DomainContactValidationRequest,
	ManagedContactDetailsTldExtraFieldsShape,
	PossiblyCompleteDomainContactDetails,
} from '@automattic/wpcom-checkout';

export type ContactDetailsSnakeCase< T = string | null > = {
	address_1?: T;
	address_2?: T;
	city?: T;
	country_code?: T;
	email?: T;
	extra?: ContactDetailsSnakeCaseExtra< T >;
	fax?: T;
	first_name?: T;
	last_name?: T;
	organization?: T;
	phone?: T;
	phone_number_country?: T;
	postal_code?: T;
	state?: T;
	vat_id?: T;
};

export type ContactDetailsSnakeCaseExtra< T = string | null > = {
	ca?: {
		lang?: T;
		legal_type?: T;
		cira_agreement_accepted?: boolean;
	};
	fr?: {
		registrant_type?: T;
		registrant_vat_id?: T;
		trademark_number?: T;
		siren_siret?: T;
	};
	uk?: {
		registrant_type?: T;
		registration_number?: T;
		trading_name?: T;
	};
};

async function fetchCachedContactDetails(): Promise< PossiblyCompleteDomainContactDetails > {
	const rawData: ContactDetailsSnakeCase = await wpcom.req.get( '/me/domain-contact-information' );
	return convertSnakeCaseContactDetailsToCamelCase( rawData );
}

async function setCachedContactDetails( rawData: DomainContactValidationRequest ): Promise< void > {
	wpcom.req.post( '/me/domain-contact-information', rawData );
}

function convertSnakeCaseContactDetailsToCamelCase(
	rawData: ContactDetailsSnakeCase
): PossiblyCompleteDomainContactDetails {
	return {
		firstName: rawData.first_name ?? null,
		lastName: rawData.last_name ?? null,
		organization: rawData.organization ?? null,
		email: rawData.email ?? null,
		phone: rawData.phone ?? null,
		address1: rawData.address_1 ?? null,
		address2: rawData.address_2 ?? null,
		city: rawData.city ?? null,
		state: rawData.state ?? null,
		postalCode: rawData.postal_code ?? null,
		countryCode: rawData.country_code ?? null,
		fax: rawData.fax ?? null,
		extra: convertSnakeCaseContactDetailsExtraToCamelCase( rawData.extra ),
	};
}

function convertSnakeCaseContactDetailsExtraToCamelCase(
	extra: ContactDetailsSnakeCaseExtra | undefined
): ManagedContactDetailsTldExtraFieldsShape< string | null > | undefined {
	if ( ! extra ) {
		return undefined;
	}
	return {
		ca: {
			lang: extra.ca?.lang,
			legalType: extra.ca?.legal_type,
			ciraAgreementAccepted: extra.ca?.cira_agreement_accepted
				? String( extra.ca.cira_agreement_accepted )
				: undefined,
		},
		uk: {
			registrantType: extra.uk?.registrant_type,
			registrationNumber: extra.uk?.registration_number,
			tradingName: extra.uk?.trading_name,
		},
		fr: {
			registrantType: extra.fr?.registrant_type,
			trademarkNumber: extra.fr?.trademark_number,
			sirenSiret: extra.fr?.siren_siret,
		},
	};
}

const cachedContactDetailsQueryKey = [ 'user-cached-contact-details' ];

export function useCachedContactDetails( {
	isLoggedOut,
}: {
	isLoggedOut?: boolean;
} ): PossiblyCompleteDomainContactDetails | null {
	const result = useQuery( {
		queryKey: cachedContactDetailsQueryKey,
		queryFn: fetchCachedContactDetails,
		enabled: ! isLoggedOut,
	} );
	return result.data ?? null;
}

export function useUpdateCachedContactDetails(): (
	updatedData: DomainContactValidationRequest
) => void {
	const queryClient = useQueryClient();
	const mutation = useMutation< void, Error, DomainContactValidationRequest >( {
		mutationFn: setCachedContactDetails,
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: cachedContactDetailsQueryKey,
			} );
		},
	} );
	return mutation.mutate;
}

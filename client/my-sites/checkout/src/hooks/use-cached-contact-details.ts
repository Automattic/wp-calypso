import {
	domainContactInformationMutation,
	domainContactInformationQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { earlyRequestKeys, withEarlyQueryRequest } from '../lib/early-requests';
import type {
	RawCachedDomainContactDetails,
	DomainContactValidationRequest,
	ManagedContactDetailsTldExtraFieldsShape,
	PossiblyCompleteDomainContactDetails,
} from '@automattic/wpcom-checkout';

function convertSnakeCaseContactDetailsToCamelCase(
	rawData: RawCachedDomainContactDetails
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
	extra: RawCachedDomainContactDetails[ 'extra' ] | undefined
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
		in: {
			nexusDeclaration: extra.in?.nexus_declaration
				? String( extra.in.nexus_declaration )
				: undefined,
			nexusConnectionType: extra.in?.nexus_connection_type,
		},
		es: {
			registrantEntityType: extra.es?.registrant_entity_type,
			registrantIdentificationNumber: extra.es?.registrant_identification_number,
			adminIdentificationNumber: extra.es?.admin_identification_number,
			redEsAgreementAccepted: extra.es?.red_es_agreement_accepted
				? String( extra.es.red_es_agreement_accepted )
				: undefined,
			redEsAgreementVersion: extra.es?.red_es_agreement_version,
		},
	};
}

// Checkout starts this request when it mounts and the contact form reads the
// result when it mounts a moment later. Without a stale time the form would
// fetch the same details a second time.
const CACHED_CONTACT_DETAILS_STALE_TIME = 60 * 1000;

export function useCachedContactDetails( { isLoggedOut }: { isLoggedOut?: boolean } ): {
	contactDetails: PossiblyCompleteDomainContactDetails | null;
	isError: boolean;
} {
	const query = domainContactInformationQuery();
	const result = useQuery( {
		...query,
		queryFn: withEarlyQueryRequest( earlyRequestKeys.contactDetails, query.queryFn ),
		select: convertSnakeCaseContactDetailsToCamelCase,
		enabled: ! isLoggedOut,
		refetchOnWindowFocus: false,
		staleTime: CACHED_CONTACT_DETAILS_STALE_TIME,
	} );

	return {
		contactDetails: result.data ?? null,
		isError: result.isError,
	};
}

export function useUpdateCachedContactDetails(): (
	updatedData: DomainContactValidationRequest
) => void {
	return useMutation( domainContactInformationMutation() ).mutate;
}

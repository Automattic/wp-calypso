import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { findIsoCodeByLanguage } from 'calypso/a8c-for-agencies/sections/partner-directory/lib/available-languages';
import { AgencyDetails } from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';

interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

function mutationSubmitAgencyDetails(
	agencyId: number | undefined,
	agencyDetails: AgencyDetails
): Promise< Agency > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to update the profile' );
	}

	const languages = agencyDetails?.languagesSpoken?.reduce( ( acc: string[], language ) => {
		const code = findIsoCodeByLanguage( language );
		if ( code !== null ) {
			acc.push( code );
		}
		return acc;
	}, [] );

	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/profile`,
		method: 'PUT',
		body: {
			profile_company_name: agencyDetails.name,
			profile_company_email: agencyDetails.email,
			profile_company_website: agencyDetails.website,
			profile_company_bio_description: agencyDetails.bioDescription,
			profile_company_logo_url: agencyDetails.logoUrl,
			profile_company_landing_page_url: agencyDetails.landingPageUrl,
			profile_company_country: agencyDetails.country,
			profile_listing_is_global: agencyDetails.isGlobal,
			profile_listing_is_available: agencyDetails.isAvailable,
			profile_listing_industries: agencyDetails.industries,
			profile_listing_languages_spoken: languages,
			profile_listing_services: agencyDetails.services,
			profile_listing_products: agencyDetails.products,
			profile_budget_budget_lower_range: agencyDetails.budgetLowerRange,
		},
	} );
}

export default function useSubmitAgencyDetailsMutation< TContext = unknown >(
	options?: UseMutationOptions< Agency, APIError, AgencyDetails, TContext >
): UseMutationResult< Agency, APIError, AgencyDetails, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< Agency, APIError, AgencyDetails, TContext >( {
		...options,
		mutationFn: ( agencyDetails ) => mutationSubmitAgencyDetails( agencyId, agencyDetails ),
	} );
}

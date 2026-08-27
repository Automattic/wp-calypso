import { useState } from 'react';
import type { AgencyProfile } from '@automattic/api-core';

export interface DetailsFormData {
	name: string;
	email: string;
	website: string;
	bioDescription: string;
	logoUrl: string;
	landingPageUrl: string;
	country: string;
	isGlobal: boolean;
	isAvailable: boolean;
	industries: string[];
	services: string[];
	products: string[];
	languagesSpoken: string[];
	budgetLowerRange: string;
}

/**
 * The agency's public profile as details form data, or null when the agency
 * has no profile yet.
 */
export function getDetailsFormData( profile?: AgencyProfile | null ): DetailsFormData | null {
	if ( ! profile ) {
		return null;
	}

	// Despite the types, a partially built profile can arrive with any of
	// these absent (see the guards in `lib.ts` and `dashboard-content.tsx`).
	return {
		name: profile.company_details?.name ?? '',
		email: profile.company_details?.email ?? '',
		website: profile.company_details?.website ?? '',
		bioDescription: profile.company_details?.bio_description ?? '',
		logoUrl: profile.company_details?.logo_url ?? '',
		landingPageUrl: profile.company_details?.landing_page_url ?? '',
		country: profile.company_details?.country ?? '',
		isAvailable: profile.listing_details?.is_available ?? true,
		isGlobal: profile.listing_details?.is_global ?? false,
		industries: profile.listing_details?.industries ?? [],
		services: profile.listing_details?.services ?? [],
		products: profile.listing_details?.products ?? [],
		languagesSpoken: profile.listing_details?.languages_spoken ?? [],
		budgetLowerRange: profile.budget_details?.budget_lower_range ?? '0',
	};
}

export default function useDetailsForm( {
	initialFormData,
}: {
	initialFormData: DetailsFormData | null;
} ) {
	const [ formData, setFormData ] = useState< DetailsFormData >(
		initialFormData ?? {
			name: '',
			email: '',
			website: '',
			bioDescription: '',
			logoUrl: '',
			landingPageUrl: '',
			country: '',
			isGlobal: false,
			isAvailable: true,
			industries: [],
			services: [],
			products: [],
			languagesSpoken: [],
			budgetLowerRange: '0',
		}
	);

	const setFormFields = ( fields: Partial< DetailsFormData > ) => {
		setFormData( ( state ) => ( { ...state, ...fields } ) );
	};

	return {
		formData,
		setFormFields,
	};
}

import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { availableLanguages } from '../lib/available-languages';
import { AgencyDetails, AgencyDirectoryApplication } from '../types';

export function mapApplicationFormData( agency: Agency | null ): AgencyDirectoryApplication | null {
	if ( ! agency?.profile?.partner_directory_application ) {
		return null;
	}

	return {
		status: agency.profile.partner_directory_application.status,
		products: agency.profile.listing_details.products ?? [],
		services: agency.profile.listing_details.services ?? [],
		directories: agency.profile.partner_directory_application.directories.map(
			( { status, directory, is_published, urls, note } ) => ( {
				status: status,
				directory: directory,
				isPublished: is_published,
				urls: urls,
				note: note,
			} )
		),
		feedbackUrl: agency.profile.partner_directory_application.feedback_url,
		isPublished: !! agency.profile.partner_directory_application.is_published,
	};
}

export function mapAgencyDetailsFormData( agency: Agency | null ): AgencyDetails | null {
	if ( ! agency?.profile ) {
		return null;
	}

	const languages = agency.profile.listing_details.languages_spoken?.reduce(
		( acc: string[], val ) => {
			if ( availableLanguages[ val ] ) {
				acc.push( availableLanguages[ val ] );
			} else {
				acc.push( val );
			}
			return acc;
		},
		[]
	);

	return {
		name: agency.profile.company_details.name,
		email: agency.profile.company_details.email,
		website: agency.profile.company_details.website,
		bioDescription: agency.profile.company_details.bio_description,
		logoUrl: agency.profile.company_details.logo_url,
		landingPageUrl: agency.profile.company_details.landing_page_url,
		country: agency.profile.company_details.country,
		isAvailable: agency.profile.listing_details.is_available,
		isGlobal: agency.profile.listing_details.is_global,
		industries: agency.profile.listing_details.industries,
		services: agency.profile.listing_details.services,
		products: agency.profile.listing_details.products,
		languagesSpoken: languages,
		budgetLowerRange: agency.profile.budget_details.budget_lower_range,
	};
}

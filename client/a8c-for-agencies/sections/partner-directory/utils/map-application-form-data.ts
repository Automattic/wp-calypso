import { Agency } from 'calypso/state/a8c-for-agencies/types';
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
			( { status, directory, published, urls, note } ) => ( {
				status: status,
				directory: directory,
				published: published,
				urls: urls,
				note: note,
			} )
		),
		feedbackUrl: agency.profile.partner_directory_application.feedback_url,
	};
}

export function mapAgencyDetailsFormData( agency: Agency | null ): AgencyDetails | null {
	if ( ! agency?.profile ) {
		return null;
	}

	return {
		name: agency.profile.company_details.name,
		email: agency.profile.company_details.email,
		website: agency.profile.company_details.website,
		bioDescription: agency.profile.company_details.bio_description,
		logoUrl: agency.profile.company_details.logo_url,
		landingPageUrl: agency.profile.company_details.landing_page_url,
		country: agency.profile.company_details.country,
		isAvailable: agency.profile.listing_details.is_available,
		industry: agency.profile.listing_details.industry,
		services: agency.profile.listing_details.services,
		products: agency.profile.listing_details.products,
		languagesSpoken: agency.profile.listing_details.languages_spoken,
		budgetLowerRange: agency.profile.budget_details.budget_lower_range,
	};
}

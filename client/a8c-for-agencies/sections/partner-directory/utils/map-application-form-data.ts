import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDirectoryApplication } from '../types';

export default function mapApplicationFormData(
	agency: Agency | null
): AgencyDirectoryApplication | null {
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

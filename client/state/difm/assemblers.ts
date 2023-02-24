import { mapRecordKeysRecursively, camelToSnakeCase } from '@automattic/js-utils';
import type {
	DIFMDependencies,
	WebsiteContent,
	WebsiteContentRequestDTO,
} from 'calypso/state/signup/steps/website-content/types';

export function buildDIFMCartExtrasObject( dependencies: Partial< DIFMDependencies > ) {
	const {
		newOrExistingSiteChoice,
		siteTitle,
		siteDescription,
		tagline,
		selectedDesign,
		selectedSiteCategory,
		isLetUsChooseSelected,
		twitterUrl,
		facebookUrl,
		linkedinUrl,
		instagramUrl,
		displayEmail,
		displayPhone,
		displayAddress,
		selectedPageTitles,
		isStoreFlow,
	} = dependencies;

	return {
		new_or_existing_site_choice: newOrExistingSiteChoice,
		site_title: siteTitle,
		site_description: siteDescription || tagline,
		selected_design: selectedDesign?.theme,
		site_category: selectedSiteCategory,
		let_us_choose_selected: isLetUsChooseSelected,
		twitter_url: twitterUrl,
		facebook_url: facebookUrl,
		linkedin_url: linkedinUrl,
		instagram_url: instagramUrl,
		display_email: displayEmail,
		display_phone: displayPhone,
		display_address: displayAddress,
		selected_page_titles: selectedPageTitles,
		is_store_flow: isStoreFlow,
	};
}

export function buildDIFMWebsiteContentRequestDTO(
	websiteContent: WebsiteContent
): WebsiteContentRequestDTO {
	const {
		pages,
		siteLogoSection: { siteLogoUrl: site_logo_url },
		feedbackSection: { genericFeedback: generic_feedback },
	} = websiteContent;
	const pagesDTO = pages.map( ( page ) => mapRecordKeysRecursively( page, camelToSnakeCase ) );
	return {
		pages: pagesDTO,
		site_logo_url: site_logo_url ?? '',
		generic_feedback: generic_feedback ?? '',
	};
}

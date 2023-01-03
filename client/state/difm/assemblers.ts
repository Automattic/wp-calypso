import type { Design } from '@automattic/design-picker';

interface Dependencies {
	newOrExistingSiteChoice: boolean;
	siteTitle: string;
	siteDescription: string;
	tagline: string;
	selectedDesign: Design;
	selectedSiteCategory: string;
	isLetUsChooseSelected: boolean;
	twitterUrl: string;
	facebookUrl: string;
	linkedinUrl: string;
	instagramUrl: string;
	displayEmail: string;
	displayPhone: string;
	displayAddress: string;
	selectedPageTitles: string[];
	isStoreFlow: boolean;
}

export function buildDIFMCartExtrasObject( dependencies: Partial< Dependencies > ) {
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

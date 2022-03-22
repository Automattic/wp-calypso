import 'calypso/state/difm/init';
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
}

export function createDIFMCartExtrasObject(
	difmState: any,
	dependencies: Partial< Dependencies >
) {
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
	} = dependencies;

	return {
		new_or_existing_site_choice: newOrExistingSiteChoice,
		site_title: siteTitle,
		site_description: siteDescription || tagline,
		selected_design: selectedDesign?.theme,
		site_category: selectedSiteCategory,
		let_us_choose_selected: isLetUsChooseSelected,
		twitter_url: twitterUrl || difmState.socialProfiles.TWITTER,
		facebook_url: facebookUrl || difmState.socialProfiles.FACEBOOK,
		linkedin_url: linkedinUrl || difmState.socialProfiles.LINKEDIN,
		instagram_url: instagramUrl || difmState.socialProfiles.INSTAGRAM,
		...( displayEmail && { display_email: displayEmail } ),
		...( displayPhone && { display_phone: displayPhone } ),
		...( displayAddress && { display_address: displayAddress } ),
	};
}

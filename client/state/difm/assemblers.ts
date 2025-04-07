import config from '@automattic/calypso-config';
import { mapRecordKeysRecursively, camelToSnakeCase } from '@automattic/js-utils';
import { logToLogstash } from 'calypso/lib/logstash';
import { addQueryArgs } from 'calypso/lib/url';
import type {
	DIFMDependencies,
	WebsiteContent,
	WebsiteContentRequestDTO,
} from 'calypso/state/signup/steps/website-content/types';
import type { SiteId } from 'calypso/types';

const logValidationFailure = (
	message: string,
	context: string,
	dependencies: Partial< DIFMDependencies >
) => {
	logToLogstash( {
		feature: 'calypso_client',
		message,
		severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
		properties: {
			type: 'calypso_difm_extras_validation_failure',
			dependencies: JSON.stringify( dependencies ),
			context,
		},
	} );
};

export function buildDIFMCartExtrasObject(
	dependencies: Partial< DIFMDependencies >,
	siteId: SiteId,
	context: string
) {
	const {
		newOrExistingSiteChoice,
		siteTitle,
		siteDescription,
		tagline,
		searchTerms,
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

	if ( ! siteTitle ) {
		logValidationFailure( 'siteTitle does not exist', context, dependencies );
	}

	if ( ! selectedPageTitles?.length ) {
		logValidationFailure( 'selectedPageTitles does not exist', context, dependencies );
	}

	return {
		new_or_existing_site_choice: newOrExistingSiteChoice,
		site_title: siteTitle || 'NO_SITE_TITLE',
		site_description: siteDescription || tagline,
		search_terms: searchTerms,
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
		afterPurchaseUrl: addQueryArgs( { siteId }, '/start/site-content-collection' ),
	};
}

export function buildDIFMWebsiteContentRequestDTO(
	websiteContent: WebsiteContent
): WebsiteContentRequestDTO {
	const {
		pages,
		siteInformationSection: { siteLogoUrl: site_logo_url, searchTerms: search_terms },
		feedbackSection: { genericFeedback: generic_feedback },
	} = websiteContent;
	const pagesDTO = pages
		.map( ( page ) => {
			return {
				...page,
				media: page.media.filter( ( mediaItem ) => !! mediaItem.url ),
			};
		} )
		.map( ( page ) => mapRecordKeysRecursively( page, camelToSnakeCase ) );
	return {
		pages: pagesDTO,
		site_logo_url: site_logo_url ?? '',
		generic_feedback: generic_feedback ?? '',
		search_terms: search_terms ?? '',
	};
}

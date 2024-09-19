import {
	BLOG_PAGE,
	CASE_STUDIES_PAGE,
	CONTACT_PAGE,
	CUSTOM_PAGE,
	PHOTO_GALLERY_PAGE,
	PORTFOLIO_PAGE,
	SHOP_PAGE,
	VIDEO_GALLERY_PAGE,
} from 'calypso/signup/difm/constants';
import {
	ContactPageDetails,
	CustomPageDetails,
	FeedbackSection,
	SiteInformation,
} from 'calypso/signup/steps/website-content/section-types';
import { SITE_INFORMATION_SECTION_ID } from 'calypso/state/signup/steps/website-content/constants';
import { WebsiteContent } from 'calypso/state/signup/steps/website-content/types';
import { DefaultPageDetails } from './section-types/default-page-details';
import type {
	AccordionSectionProps,
	SectionGeneratorReturnType,
} from 'calypso/signup/accordion-form/types';
import type { PageId } from 'calypso/signup/difm/constants';
import type { TranslateResult } from 'i18n-calypso';

interface SectionProcessedResult {
	sectionsDetails: Array< {
		title: TranslateResult;
		component: React.ReactElement;
		showSkip: boolean;
		validate?: () => { result: boolean; errors: Record< string, TranslateResult | null > };
	} >;
	elapsedSections: number;
}

const generateSiteInformationSection = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
): SectionProcessedResult => {
	const { translate, formValues, formErrors } = params;

	const fieldNumber = elapsedSections + 1;
	return {
		sectionsDetails: [
			{
				title: translate( '%(fieldNumber)d. Site Information', {
					args: {
						fieldNumber,
					},
					comment: 'This is the serial number: 1',
				} ),
				component: (
					<SiteInformation
						sectionID={ SITE_INFORMATION_SECTION_ID }
						formErrors={ formErrors }
						searchTerms={ formValues.siteInformationSection?.searchTerms }
						// The structure of the state tree changed and can generate errors for stale data where siteLogoUrl lived in the root of this state tree
						// So the optional parameter was added to safegaurd for any errors.
						// This should eventually be removed with a fix that prevents this type of bug
						logoUrl={ formValues.siteInformationSection?.siteLogoUrl }
					/>
				),
				showSkip: false,
				validate: () => {
					const isValid = Boolean( formValues.siteInformationSection?.searchTerms?.length );
					return {
						result: isValid,
						errors: {
							searchTerms: isValid ? null : translate( `Please enter search terms.` ),
						},
					};
				},
			},
		],
		elapsedSections: elapsedSections + 1,
	};
};

const resolveDisplayedComponent = ( pageId: string ) => {
	switch ( pageId ) {
		case CONTACT_PAGE:
			return ContactPageDetails;
		case CUSTOM_PAGE:
			return CustomPageDetails;
		default:
			return DefaultPageDetails;
	}
};

const generateWebsiteContentSections = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
): SectionProcessedResult => {
	const { translate, formValues, formErrors, context, onChangeField } = params;

	const OPTIONAL_PAGES: Partial< Record< PageId, boolean > > = {
		[ CONTACT_PAGE ]: true,
		[ BLOG_PAGE ]: true,
		[ SHOP_PAGE ]: true,
		[ VIDEO_GALLERY_PAGE ]: true,
		[ PHOTO_GALLERY_PAGE ]: true,
		[ PORTFOLIO_PAGE ]: true,
		[ CASE_STUDIES_PAGE ]: true,
	};

	const websiteContentSections = formValues.pages.map( ( page, index ) => {
		const fieldNumber = elapsedSections + index + 1;
		let pageTitle = page.title;

		if ( ! pageTitle && page.id === CUSTOM_PAGE ) {
			pageTitle = translate( 'Custom Page' );
		}

		const DisplayedPageComponent = resolveDisplayedComponent( page.id );

		return {
			title: translate( '%(fieldNumber)d. %(pageTitle)s', {
				args: {
					fieldNumber,
					pageTitle,
				},
				comment: 'This is the serial number: 1',
			} ),
			summary: page.useFillerContent ? translate( 'AI Content 🌟' ) : page.content,
			component: (
				<DisplayedPageComponent
					page={ page }
					formErrors={ formErrors }
					onChangeField={ onChangeField }
					context={ context }
				/>
			),
			showSkip: !! OPTIONAL_PAGES[ page.id ],
			validate: () => {
				const isContentValid =
					OPTIONAL_PAGES[ page.id ] || Boolean( page.content?.length ) || page.useFillerContent;
				const isTitleValid = Boolean( page.title?.length );

				return {
					result: isContentValid && isTitleValid,
					errors: {
						content: isContentValid ? null : translate( 'Please enter content for this page.' ),
						title: isTitleValid ? null : translate( 'Please enter a title for this page.' ),
					},
				};
			},
		};
	} );
	return {
		elapsedSections: elapsedSections + formValues.pages.length,
		sectionsDetails: websiteContentSections,
	};
};

const generateFeedbackSection = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
): SectionProcessedResult => {
	const { translate, formValues } = params;

	const fieldNumber = elapsedSections + 1;
	return {
		sectionsDetails: [
			{
				title: translate( '%(fieldNumber)d. Submit Content', {
					args: {
						fieldNumber,
					},
					comment: 'This is the serial number: 1',
				} ),
				component: <FeedbackSection data={ formValues.feedbackSection } />,
				showSkip: true,
			},
		],
		elapsedSections: elapsedSections + 1,
	};
};

export const sectionGenerator = (
	params: SectionGeneratorReturnType< WebsiteContent >
): AccordionSectionProps< any >[] => {
	const { elapsedSections: elapsedSectionsAfterLogo, sectionsDetails: siteInformationSection } =
		generateSiteInformationSection( params );

	const {
		sectionsDetails: websiteContentSections,
		elapsedSections: elapsedSectionAfterWebsiteContent,
	} = generateWebsiteContentSections( params, elapsedSectionsAfterLogo );

	const { sectionsDetails: feedbackSection } = generateFeedbackSection(
		params,
		elapsedSectionAfterWebsiteContent
	);

	return [ ...siteInformationSection, ...websiteContentSections, ...feedbackSection ];
};

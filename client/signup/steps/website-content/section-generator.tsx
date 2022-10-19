import { CONTACT_PAGE } from 'calypso/signup/difm/constants';
import {
	ContactPageDetails,
	FeedbackSection,
	LogoUploadSection,
} from 'calypso/signup/steps/website-content/section-types';
import { LOGO_SECTION_ID } from 'calypso/state/signup/steps/website-content/reducer';
import { WebsiteContent } from 'calypso/state/signup/steps/website-content/schema';
import { CONTENT_SUFFIX, DefaultPageDetails } from './section-types/default-page-details';
import type {
	AccordionSectionProps,
	SectionGeneratorReturnType,
} from 'calypso/signup/accordion-form/types';
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

const generateLogoSection = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
): SectionProcessedResult => {
	const { translate, formValues } = params;

	const fieldNumber = elapsedSections + 1;
	return {
		sectionsDetails: [
			{
				title: translate( '%(fieldNumber)d. Site Logo', {
					args: {
						fieldNumber,
					},
					comment: 'This is the serial number: 1',
				} ),
				component: (
					<LogoUploadSection
						sectionID={ LOGO_SECTION_ID }
						logoUrl={ formValues.siteLogoSection.siteLogoUrl }
					/>
				),
				showSkip: true,
			},
		],
		elapsedSections: elapsedSections + 1,
	};
};

const resolveDisplayedComponent = ( pageId: string ) => {
	switch ( pageId ) {
		case CONTACT_PAGE:
			return ContactPageDetails;
		default:
			return DefaultPageDetails;
	}
};

const generateWebsiteContentSections = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
): SectionProcessedResult => {
	const { translate, formValues, formErrors, onChangeField } = params;

	const OPTIONAL_PAGES: Record< string, boolean > = { [ CONTACT_PAGE ]: true };
	const PAGE_LABELS: Record< string, TranslateResult > = {
		[ CONTACT_PAGE ]: translate(
			"We'll add a standard contact form on this page, plus a comment box. " +
				'If you would like text to appear above this form, please enter it below.'
		),
	};

	const websiteContentSections = formValues.pages.map( ( page, index ) => {
		const fieldNumber = elapsedSections + index + 1;
		const { title: pageTitle } = page;
		const DisplayedPageComponent = resolveDisplayedComponent( page.id );

		switch ( page.id ) {
			case CONTACT_PAGE:
				break;

			default:
				break;
		}
		return {
			title: translate( '%(fieldNumber)d. %(pageTitle)s', {
				args: {
					fieldNumber,
					pageTitle,
				},
				comment: 'This is the serial number: 1',
			} ),
			summary: page.content,
			component: (
				<DisplayedPageComponent
					page={ page }
					formErrors={ formErrors }
					label={ PAGE_LABELS[ page.id ] }
					onChangeField={ onChangeField }
				/>
			),
			showSkip: !! OPTIONAL_PAGES[ page.id ],
			validate: () => {
				const isValid = OPTIONAL_PAGES[ page.id ] || Boolean( page.content?.length );
				return {
					result: isValid,
					errors: {
						[ page.id + CONTENT_SUFFIX ]: isValid
							? null
							: translate( `Please enter '%(pageTitle)s' content`, {
									args: {
										pageTitle,
									},
							  } ),
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
	const { elapsedSections: elapsedSectionsAfterLogo, sectionsDetails: logoSection } =
		generateLogoSection( params );

	const {
		sectionsDetails: websiteContentSections,
		elapsedSections: elapsedSectionAfterWebsiteContent,
	} = generateWebsiteContentSections( params, elapsedSectionsAfterLogo );

	const { sectionsDetails: feedbackSection } = generateFeedbackSection(
		params,
		elapsedSectionAfterWebsiteContent
	);

	return [ ...logoSection, ...websiteContentSections, ...feedbackSection ];
};

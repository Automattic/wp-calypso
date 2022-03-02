import { WebsiteContent } from 'calypso/state/signup/steps/website-content/schema';
import { LogoUploadSection } from './logo-upload-section';
import { CONTENT_SUFFIX, PageDetails } from './page-details';
import type {
	AccordionSectionProps,
	SectionGeneratorReturnType,
} from 'calypso/signup/accordion-form/types';
import type { TranslateResult } from 'i18n-calypso';

const generateWebsiteContentSections = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
) => {
	const { translate, formValues, formErrors, onChangeField } = params;

	const OPTIONAL_PAGES: Record< string, boolean > = { Contact: true };
	const PAGE_LABELS: Record< string, TranslateResult > = {
		Contact: translate(
			"We'll add a standard contact form on this page, plus a comment box. " +
				'If you would like text to appear above this form, please enter it below.'
		),
	};

	const websiteContentSections = formValues.pages.map( ( page, index ) => {
		const fieldNumber = elapsedSections + index + 1;
		const { title: pageTitle } = page;
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
				<PageDetails
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
	return { elapsedSections: elapsedSections + formValues.pages.length, websiteContentSections };
};
const generateLogoSection = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
) => {
	const { translate, formValues } = params;

	const fieldNumber = elapsedSections + 1;
	return {
		title: translate( '%(fieldNumber)d. Site Logo', {
			args: {
				fieldNumber,
			},
			comment: 'This is the serial number: 1',
		} ),
		component: <LogoUploadSection logoUrl={ formValues.siteLogoUrl } />,
		showSkip: true,
		elapsedSections: elapsedSections + 1,
	};
};

export const sectionGenerator = ( params: SectionGeneratorReturnType< WebsiteContent > ) => {
	const { elapsedSections, ...logoSection } = generateLogoSection( params );

	const {
		websiteContentSections,
	}: {
		websiteContentSections: AccordionSectionProps< WebsiteContent >[];
	} = generateWebsiteContentSections( params, elapsedSections );

	return [ logoSection, ...websiteContentSections ];
};

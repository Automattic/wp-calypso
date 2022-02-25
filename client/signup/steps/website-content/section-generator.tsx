import { TranslateResult, translate } from 'i18n-calypso';
import {
	AccordionSectionProps,
	SectionGeneratorReturnType,
} from 'calypso/signup/accordion-form/types';
import { WebsiteContent } from 'calypso/state/signup/steps/website-content/schema';
import { LogoUploadSection } from './logo-upload-section';
import { CONTENT_SUFFIX, PageDetails } from './page-details';

const PAGE_TITLES: Record< string, TranslateResult > = { Home: translate( 'Home' ) };

const generateWebsiteContentSections = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
) => {
	const { translate, formValues, formErrors, onChangeField } = params;
	const websiteContentSections = formValues.pages.map( ( page, index ) => {
		const fieldNumber = elapsedSections + index + 1;
		const pageTitle = PAGE_TITLES[ page.id ] ? PAGE_TITLES[ page.id ] : page.title;
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
				<PageDetails page={ page } formErrors={ formErrors } onChangeField={ onChangeField } />
			),
			showSkip: false,
			validate: () => {
				const isValid = Boolean( page.content?.length );
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
	const pageTitle = 'Site logo';
	return {
		title: translate( '%(fieldNumber)d. %(pageTitle)s', {
			args: {
				fieldNumber,
				pageTitle,
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

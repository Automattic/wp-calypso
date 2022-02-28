import {
	AccordionSectionProps,
	SectionGeneratorReturnType,
} from 'calypso/signup/accordion-form/types';
import { WebsiteContent } from 'calypso/state/signup/steps/website-content/schema';
import { LogoUploadSection } from './logo-upload-section';
import { CONTENT_SUFFIX, PageDetails } from './page-details';

const generateWebsiteContentSections = (
	params: SectionGeneratorReturnType< WebsiteContent >,
	elapsedSections = 0
) => {
	const { translate, formValues, formErrors, onChangeField } = params;
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

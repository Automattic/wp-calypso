import {
	AccordionSectionProps,
	SectionGeneratorReturnType,
} from 'calypso/signup/accordion-form/types';
import { WebsiteContent } from 'calypso/state/signup/steps/website-content/schema';
import { CONTENT_SUFFIX, PageDetails } from './page-details';

const PAGE_TITLES: Record< string, string > = { Home: 'Homepage' };

export const sectionGenerator = ( params: SectionGeneratorReturnType< WebsiteContent > ) => {
	const { translate, formValues, formErrors, onChangeField } = params;
	const sections: AccordionSectionProps< WebsiteContent >[] = formValues.map( ( page, index ) => {
		const fieldNumber = index + 1;
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

	return sections;
};

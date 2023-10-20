import { TextAreaField, ContactInformation } from 'calypso/signup/accordion-form/form-components';
import { useTranslatedPageDescriptions } from 'calypso/signup/difm/translation-hooks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { MediaUpload } from './components/media-upload';
import { useChangeHandlers } from './hooks/use-change-handlers';
import type { PageDetailsParams } from './default-page-details';
import type { ContactPageData } from 'calypso/state/signup/steps/website-content/types';

export function ContactPageDetails( {
	page,
	formErrors,
	context,
	onChangeField,
}: PageDetailsParams< ContactPageData > ) {
	const site = useSelector( getSelectedSite );
	const description = useTranslatedPageDescriptions( page.id, context );
	const { onFieldChanged } = useChangeHandlers( {
		pageId: page.id,
		onChangeField,
	} );

	return (
		<>
			<TextAreaField
				name="content"
				onChange={ onFieldChanged }
				value={ page.content }
				error={ formErrors[ 'content' ] }
				label={ description }
			/>
			<ContactInformation
				displayEmailProps={ {
					value: page.displayEmail || '',
					name: 'displayEmail',
				} }
				displayPhoneProps={ {
					value: page.displayPhone || '',
					name: 'displayPhone',
				} }
				displayAddressProps={ {
					value: page.displayAddress || '',
					name: 'displayAddress',
				} }
				onChange={ onFieldChanged }
			/>

			{ site && <MediaUpload page={ page } site={ site } onChangeField={ onChangeField } /> }
		</>
	);
}

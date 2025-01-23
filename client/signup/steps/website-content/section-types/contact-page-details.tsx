import { numberFormat, useTranslate } from 'i18n-calypso';
import { TextAreaField, ContactInformation } from 'calypso/signup/accordion-form/form-components';
import { useTranslatedPageDescriptions } from 'calypso/signup/difm/translation-hooks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { MediaUpload } from './components/media-upload';
import { CHARACTER_LIMIT } from './constants';
import { useChangeHandlers } from './hooks/use-change-handlers';
import type { PageDetailsParams } from './default-page-details';
import type { ContactPageData } from 'calypso/state/signup/steps/website-content/types';

export function ContactPageDetails( {
	page,
	formErrors,
	context,
	onChangeField,
}: PageDetailsParams< ContactPageData > ) {
	const translate = useTranslate();
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
				characterLimit={ CHARACTER_LIMIT }
				characterLimitError={ translate(
					"Please shorten your text to under %(characterLimit)s characters for optimal formatting. If it remains over this limit, we'll optimize it with AI when building your site.",
					{
						args: {
							characterLimit: numberFormat( CHARACTER_LIMIT ),
						},
						comment: '%(characterLimit)s is a formatted number, eg: 5,000.',
					}
				) }
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

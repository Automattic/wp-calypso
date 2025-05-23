import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import {
	TextAreaField,
	CheckboxField,
	TextInputField,
} from 'calypso/signup/accordion-form/form-components';
import { useTranslatedPageDescriptions } from 'calypso/signup/difm/translation-hooks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { MediaUpload } from './components/media-upload';
import { CHARACTER_LIMIT } from './constants';
import { useChangeHandlers } from './hooks/use-change-handlers';
import type { ValidationErrors } from 'calypso/signup/accordion-form/types';
import type { BBETranslationContext } from 'calypso/signup/difm/translation-hooks';
import type { PageData } from 'calypso/state/signup/steps/website-content/types';

export interface PageDetailsParams< T > {
	page: T;
	formErrors: ValidationErrors;
	context: BBETranslationContext;
	onChangeField?: ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => void;
}
export function CustomPageDetails( {
	page,
	formErrors,
	context,
	onChangeField,
}: PageDetailsParams< PageData > ) {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const description = useTranslatedPageDescriptions( page.id, context );

	const { onCheckboxChanged, onFieldChanged } = useChangeHandlers( {
		pageId: page.id,
		onChangeField,
	} );

	return (
		<>
			<TextInputField
				label={ translate( 'Page Title' ) }
				placeholder={ translate( 'My Custom Page' ) }
				onChange={ onFieldChanged }
				name="title"
				error={ formErrors[ 'title' ] }
				value={ page.title }
			/>
			<TextAreaField
				name="content"
				onChange={ onFieldChanged }
				value={ page.content }
				error={ formErrors[ 'content' ] }
				label={ description }
				disabled={ !! page.useFillerContent }
				hasFillerContentCheckbox
				characterLimit={ CHARACTER_LIMIT }
				characterLimitError={ translate(
					"Please shorten your text to under %(characterLimit)s characters for optimal formatting. If it remains over this limit, we'll optimize it with AI when building your site.",
					{
						args: {
							characterLimit: formatNumber( CHARACTER_LIMIT ),
						},
						comment: '%(characterLimit)s is a formatted number, eg: 5,000.',
					}
				) }
			/>
			<CheckboxField
				name="useFillerContent"
				checked={ page.useFillerContent || false }
				value="true"
				onChange={ onCheckboxChanged }
				label={ translate( 'Build this page with AI-generated text.' ) }
				helpText={ translate(
					'When building your site, we will use AI to generate copy based on the search phrases you have provided. The copy can be edited later with the WordPress editor.'
				) }
			/>
			{ site && <MediaUpload page={ page } site={ site } onChangeField={ onChangeField } /> }
		</>
	);
}

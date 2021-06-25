/**
 * External dependencies
 */
import * as React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';

const INITIAL_UPDATE_FORM_STATE = {
	description: '',
	is_public: true,
	title: '',
};
const INITIAL_CREATE_FORM_STATE = {
	...INITIAL_UPDATE_FORM_STATE,
	slug: '',
};

export default function ListForm( { isCreateForm, isSubmissionDisabled, list = {}, onSubmit } ) {
	const translate = useTranslate();
	const [ formList, updateFormList ] = React.useState(
		isCreateForm ? INITIAL_CREATE_FORM_STATE : { ...INITIAL_UPDATE_FORM_STATE, ...list }
	);
	const onChange = ( event ) => {
		const update = { [ event.target.dataset.key ]: event.target.value };
		if ( 'is_public' in update ) {
			update.is_public = update.is_public === 'public';
		}
		updateFormList( { ...formList, ...update } );
	};

	const isNameValid = typeof formList.title === 'string' && formList.title.length > 0;
	const isSlugValid =
		isCreateForm || ( typeof formList.slug === 'string' && formList.slug.length > 0 );

	return (
		<Card>
			<FormFieldset>
				<FormLabel htmlFor="list-name">{ translate( 'Name (Required)' ) }</FormLabel>
				<FormTextInput
					data-key="title"
					id="list-name"
					isValid={ isNameValid }
					name="list-name"
					onChange={ onChange }
					value={ formList.title }
				/>
				<FormSettingExplanation>{ translate( 'The name of the list.' ) }</FormSettingExplanation>
			</FormFieldset>

			{ ! isCreateForm && (
				<FormFieldset>
					<FormLabel htmlFor="list-slug">{ translate( 'Slug' ) }</FormLabel>
					<FormTextInput
						data-key="slug"
						// NOTE: Slug modification currently doesn't work in the API.
						disabled
						id="list-slug"
						name="list-slug"
						value={ formList.slug }
					/>
					<FormSettingExplanation>
						{ translate( 'This is used to build the URL to the list.' ) }
					</FormSettingExplanation>
				</FormFieldset>
			) }

			<FormFieldset>
				<FormLegend>{ translate( 'Visibility' ) }</FormLegend>
				<FormLabel>
					<FormRadio
						checked={ formList.is_public }
						data-key="is_public"
						onChange={ onChange }
						value="public"
						label={ translate( 'Everyone can view this list' ) }
					/>
				</FormLabel>

				<FormLabel>
					<FormRadio
						checked={ ! formList.is_public }
						data-key="is_public"
						onChange={ onChange }
						value="private"
						label={ translate( 'Only I can view this list' ) }
					/>
				</FormLabel>
				<FormSettingExplanation>
					{ translate(
						"Don't worry, posts from private sites will only appear to those with access. " +
							'Adding a private site to a public list will not make posts from that site accessible to everyone.'
					) }
				</FormSettingExplanation>
			</FormFieldset>

			<FormFieldset>
				<FormLabel htmlFor="list-description">{ translate( 'Description' ) }</FormLabel>
				<FormTextarea
					data-key="description"
					id="list-description"
					name="list-description"
					onChange={ onChange }
					placeholder={ translate( "What's your list about?" ) }
					value={ formList.description }
				/>
			</FormFieldset>
			<FormButtonsBar>
				<FormButton
					primary
					disabled={ isSubmissionDisabled || ! isNameValid || ! isSlugValid }
					onClick={ () => onSubmit( formList ) }
				>
					{ translate( 'Save' ) }
				</FormButton>
			</FormButtonsBar>
		</Card>
	);
}

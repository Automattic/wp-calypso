import { userSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { getLanguage, isDefaultLocale, isTranslatedIncompletely } from '@automattic/i18n-utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Notice,
	Button,
	__experimentalVStack as VStack,
	ExternalLink,
	ComboboxControl,
	CheckboxControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { useMemo, useState, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Card, CardBody } from '../../components/card';
import FlashMessage, { reloadWithFlashMessage } from '../../components/flash-message';
import { SectionHeader } from '../../components/section-header';
import {
	languagesAsOptions,
	shouldDisplayCommunityTranslator,
	getLocaleVariantOrLanguage,
	CalypsoLanguage,
} from './languages';
import type { UserSettings } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';

export default function PreferencesLanguageForm() {
	const { createErrorNotice } = useDispatch( noticesStore );
	const { data: serverData } = useQuery( {
		...userSettingsQuery(),
		meta: { persist: false },
	} );
	const [ formData, setFormData ] = useState< Partial< UserSettings > | undefined >();
	const mutation = useMutation( userSettingsMutation() );

	/**
	 * When we save the language, in case we're using a locale_variant (a language without an official locale)
	 * the API will return the parent language (example: es-cl will return 'es' in the 'language' field)
	 * as such, we're overriding the language with the locale_variant, if present, this saves us from checking the data and allows us to
	 * trust that the 'language' field contains a locale from the languages.
	 */
	if ( serverData?.locale_variant ) {
		serverData.language = serverData.locale_variant;
	}
	const data = useMemo(
		() => ( serverData ? { ...serverData, ...formData } : undefined ),
		[ serverData, formData ]
	);

	if ( ! data ) {
		return null;
	}
	// We need the CalypsoLanguage to show the % of translated content in the use_fallback_for_incomplete_languages
	const selectedLanguage: CalypsoLanguage | undefined = data.language
		? ( getLanguage( data.language ) as CalypsoLanguage )
		: undefined;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! formData ) {
			return;
		}
		const mutationData = formData;
		mutation.mutate( mutationData, {
			onSuccess: () => {
				reloadWithFlashMessage( 'language' );
			},
			onError: ( error ) => {
				// Prepend previous attempted data back into local edits
				setFormData( ( current ) => ( { ...mutationData, ...current } ) );
				createErrorNotice( error.message ?? __( 'Language setting could not be saved.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const isDefaultLanguageSelected = !! data.language && isDefaultLocale( data.language );
	const showIncompleteLocaleControl =
		! isDefaultLanguageSelected && !! data.language && isTranslatedIncompletely( data.language );
	const isSaving = mutation.isPending;

	const isDirty =
		!! formData &&
		!! serverData &&
		Object.entries( formData ).some( ( [ key, value ] ) => {
			return serverData[ key as keyof UserSettings ] !== value;
		} );

	const hasValidLanguage = !! data?.language;
	const canSubmit = ! isSaving && isDirty && hasValidLanguage;
	const languageForm: Form = {
		layout: {
			type: 'regular' as const,
			labelPosition: 'top' as const,
		},
		fields: [
			{
				id: 'interfaceLanguage',
				children: [
					'language',
					'use_fallback_for_incomplete_languages',
					'enable_translator',
					'i18n_empathy_mode',
				],
			},
		],
	};

	const languageFields: Field< UserSettings >[] = [
		{
			id: 'language',
			label: __( 'Interface language' ),
			type: 'text',
			Edit: ( { field, data, onChange } ) => {
				const locale = data?.language;
				const language =
					locale && shouldDisplayCommunityTranslator( locale )
						? getLocaleVariantOrLanguage( locale )
						: undefined;

				const helpText = language
					? createInterpolateElement(
							sprintf(
								/* translators: %s: selected interface language */
								__(
									'Thanks to all our <externalLink>community members who helped translate to %s</externalLink>'
								),
								language.name
							),
							{
								externalLink: (
									<ExternalLink
										href={ `https://translate.wordpress.com/translators/?contributor_locale=${ language.langSlug }` }
										children={ null }
									/>
								),
							}
					  )
					: undefined;

				return (
					<ComboboxControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						value={ field.getValue( { item: data } ) ?? '' }
						label={ __( 'Interface language' ) }
						onChange={ ( newValue ) => {
							onChange( {
								[ field.id ]: newValue,
							} );
						} }
						placeholder={ __( 'Select a language' ) }
						options={ field.elements || [] }
						allowReset={ false } // a language is required so we're not allowing to reset it and have an empty state.
						help={ helpText }
					/>
				);
			},
			elements: languagesAsOptions,
		},
		{
			id: 'use_fallback_for_incomplete_languages',
			label: __( 'Display interface in English' ),
			description:
				/* translators: %(languageName)s is a localized language name, %(percentTranslated)d%% is a percentage number (0-100), followed by an escaped percent sign %%. */
				sprintf( __( '(%(languageName)s is only %(percentTranslated)d%% translated)' ), {
					languageName: selectedLanguage?.name,
					percentTranslated: selectedLanguage?.calypsoPercentTranslated,
				} ),
			type: 'boolean',
			Edit: 'checkbox',
			isVisible: () => showIncompleteLocaleControl,
		},
		{
			id: 'i18n_empathy_mode',
			label: 'Empathy mode (a8c-only)',
			type: 'boolean',
			isVisible: () => config.isEnabled( 'i18n/empathy-mode' ),
			Edit: ( { field, data, onChange } ) => {
				const isEmpathyModeFieldDisabled =
					! data.language || data.language === '' || !! isDefaultLocale( data.language );
				return (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ isEmpathyModeFieldDisabled ? false : field.getValue( { item: data } ) }
						label={ field.label }
						disabled={ isEmpathyModeFieldDisabled }
						onChange={ ( newValue ) => {
							onChange( {
								[ field.id ]: newValue,
							} );
						} }
					/>
				);
			},
		},
		{
			id: 'enable_translator',
			label: __( 'Enable the in-page translator where available' ),
			type: 'boolean',
			isVisible: ( item ) => shouldDisplayCommunityTranslator( item.language ),
			Edit: ( { field, data, onChange } ) => {
				return (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ field.getValue( { item: data } ) }
						label={ field.label }
						onChange={ ( newValue ) => {
							onChange( {
								[ field.id ]: newValue,
							} );
						} }
						help={ createInterpolateElement(
							__( 'This allows you to help translate WordPress.com. <LearnMore/>' ),
							{
								LearnMore: (
									<ExternalLink href="https://translate.wordpress.com/community-translator/">
										{ __( 'Learn more' ) }
									</ExternalLink>
								),
							}
						) }
					/>
				);
			},
		},
	];

	return (
		<form onSubmit={ handleSubmit }>
			<FlashMessage id="language" message={ __( 'Language setting saved.' ) } />
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Language' ) }
							description={ __( 'Use this to set the display language for WordPress.com.' ) }
						/>
						<DataForm< UserSettings >
							data={ data }
							fields={ languageFields }
							form={ languageForm }
							onChange={ ( edits: Partial< UserSettings > ) => {
								setFormData( ( current ) => ( { ...current, ...edits } ) );
							} }
						/>
						{ mutation.error && (
							<Notice status="error" isDismissible={ false }>
								{ mutation.error.message }
							</Notice>
						) }
						<div>
							<Button
								variant="primary"
								type="submit"
								accessibleWhenDisabled
								isBusy={ isSaving }
								disabled={ ! canSubmit }
							>
								{ __( 'Save' ) }
							</Button>
						</div>
					</VStack>
				</CardBody>
			</Card>
		</form>
	);
}

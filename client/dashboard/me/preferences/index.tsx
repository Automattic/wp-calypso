import config from '@automattic/calypso-config';
// eslint-disable-next-line no-restricted-imports
import {
	canBeTranslated,
	getLanguage,
	isDefaultLocale,
	isLocaleVariant,
} from '@automattic/i18n-utils';
import { SubLanguage } from '@automattic/languages';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Notice,
	Button,
	Card,
	CardBody,
	__experimentalVStack as VStack,
	ExternalLink,
	ComboboxControl,
	CheckboxControl,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { useMemo, useState, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	userPreferencesMutation,
	userPreferencesQuery,
} from '../../app/queries/me-user-preferences';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { languagesAsOptions } from '../../data/languages';
import { UserSettingsPreferences } from '../../data/me-user-preferences';
import type { Field } from '@wordpress/dataviews';

const languageForm = {
	type: 'regular' as const,
	labelPosition: 'top' as const,
	fields: [
		{
			id: 'interfaceLanguage',
			label: __( 'Language' ),
			children: [ 'language', 'enable_translator', 'i18n_empathy_mode' ],
		},
	],
};

// TODO add tests.
/**
 * Adapted from https://github.com/Automattic/wp-calypso/blob/fbeb9c37266e2bfac7af881b1672a9f6d72a0670/client/me/account/main.jsx#L299
 * In this case the data.language is the locale variant if we're using one, so we can skip the "isLocaleVariant checks and see if the locale can be translated or not"
 */
const shouldDisplayCommunityTranslator = ( data: UserSettingsPreferences ): boolean => {
	const locale = data.language;

	// disable for locales
	if ( ! locale || ! canBeTranslated( locale ) ) {
		return false;
	}

	return true;
};

const thanksToCommunityTranslator = ( data: UserSettingsPreferences ) => {
	if ( ! shouldDisplayCommunityTranslator( data ) ) {
		return;
	}

	let language = getLanguage( data.language );

	// if it's a variant, we want the parent language
	if ( language && isLocaleVariant( language.langSlug ) ) {
		language = getLanguage( ( language as SubLanguage ).parentLangSlug );
	}
	if ( ! language ) {
		return;
	}
	return (
		<>
			<br />
			{ createInterpolateElement(
				sprintf(
					/* translators: %s: selected interface language */
					__(
						'Thanks to all our <external>community members who helped translate to %s</external>'
					),
					language.name
				),
				{
					external: (
						<ExternalLink
							href={ `https://translate.wordpress.com/translators/?contributor_locale=${ language.langSlug }` }
						/>
					),
				}
			) }
		</>
	);
};

export default function Preferences() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: serverData } = useQuery( userPreferencesQuery() );
	const [ localData, setLocalData ] = useState< Partial< UserSettingsPreferences > | undefined >();
	const [ savingData, setSavingData ] = useState<
		Partial< UserSettingsPreferences > | undefined
	>();
	// in case we're using a locale variant we'll override the language since that's what's being used in the combobox.
	if ( serverData?.locale_variant && serverData.locale_variant !== '' ) {
		serverData.language = serverData.locale_variant;
	}
	const data = useMemo(
		() => ( serverData ? { ...serverData, ...savingData, ...localData } : undefined ),
		[ serverData, savingData, localData ]
	);
	const shouldShowEmpathyMode = config.isEnabled( 'i18n/empathy-mode' );
	const mutation = useMutation( userPreferencesMutation() );
	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! localData ) {
			return;
		}
		const mutationData = localData;
		setLocalData( undefined );
		setSavingData( mutationData );
		mutation.mutate( mutationData, {
			onSettled: () => {
				setSavingData( undefined );
				createSuccessNotice( __( 'Language setting saved.' ), { type: 'snackbar' } );
				// TODO we need to reload the page to make sure the language is updated https://github.com/Automattic/wp-calypso/blob/fbeb9c37266e2bfac7af881b1672a9f6d72a0670/client/me/account/controller.js#L11
			},
			onError: ( error ) => {
				// Prepend previous attempted data back into local edits
				setLocalData( ( current ) => ( { ...mutationData, ...current } ) );
				createErrorNotice( error.message ?? __( 'Language setting could not be saved.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	if ( ! data ) {
		return null;
	}

	const isSaving = mutation.isPending;
	const isDirty =
		!! localData &&
		!! serverData &&
		Object.entries( localData ).some( ( [ key, value ] ) => {
			return serverData[ key as keyof UserSettingsPreferences ] !== value;
		} );
	const hasValidLanguage = !! localData?.language && localData.language !== ''; // TODO use isItemValid once DataForm validation is updated.
	const canSubmit = ! isSaving && isDirty && hasValidLanguage;

	let saveButtonLabel = __( 'Save' );

	if ( isSaving ) {
		saveButtonLabel = __( 'Saving…' );
	} else if ( mutation.isSuccess && ! isDirty ) {
		saveButtonLabel = __( 'Saved!' );
	}

	const languageFields: Field< UserSettingsPreferences >[] = [
		{
			id: 'language',
			label: __( 'Interface language' ),
			type: 'text',
			isValid: {
				required: true,
			},
			Edit: ( { field, data, onChange } ) => {
				return (
					<>
						<ComboboxControl
							value={ field.getValue( { item: data } ) ?? '' }
							label={ __( 'Interface language' ) }
							onChange={ ( newValue ) => {
								onChange( {
									[ field.id ]: newValue,
								} );
							} }
							placeholder={ __( 'Select a language' ) }
							options={ field.elements || [] }
						/>

						<Text variant="muted">
							{ __(
								'This is the language of the interface you see across WordPress.com as a whole.'
							) }
							{ data && thanksToCommunityTranslator( data ) }
						</Text>
					</>
				);
			},
			elements: languagesAsOptions,
		},
		{
			Edit: ( { field, data, onChange } ) => {
				const isEmpathyModeFieldDisabled =
					! data.language || data.language === '' || !! isDefaultLocale( data.language );
				return (
					<CheckboxControl
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
			id: 'i18n_empathy_mode',
			label: 'Empathy mode (a8c-only)',
			description: 'Pretend to use that language but display English where a translated exists',
			type: 'boolean',
			isVisible: () => {
				return shouldShowEmpathyMode;
			},
		},
		{
			// TODO show it only when canDisplayCommunityTranslator is true, don't use the calypso/state
			Edit: 'checkbox',
			id: 'enable_translator',
			label: __( 'Enable the in-page translator where available' ),
			description: createInterpolateElement(
				__( 'This allows you to help translate WordPress.com. <external>Learn more</external>' ),
				{
					external: <ExternalLink href="https://translate.wordpress.com/community-translator/" />,
				}
			),
			type: 'boolean',
			isVisible: ( item ) => {
				return shouldDisplayCommunityTranslator( item );
			},
		},
	];

	return (
		<>
			<form onSubmit={ handleSubmit }>
				<PageLayout size="small" header={ <PageHeader title={ __( 'Preferences' ) } /> }>
					<Card>
						<CardBody>
							<VStack spacing={ 6 } className="dasboard-preferences__vstack">
								<DataForm< UserSettingsPreferences >
									data={ data }
									fields={ languageFields }
									form={ languageForm }
									onChange={ ( edits: Partial< UserSettingsPreferences > ) => {
										setLocalData( ( current ) => ( { ...current, ...edits } ) );
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
										className="language-preferences-form__submit"
										accessibleWhenDisabled
										isBusy={ isSaving }
										disabled={ ! canSubmit }
									>
										{ saveButtonLabel }
									</Button>
								</div>
							</VStack>
						</CardBody>
					</Card>
				</PageLayout>
			</form>
		</>
	);
}

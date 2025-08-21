import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Notice,
	Button,
	Card,
	CardBody,
	__experimentalVStack as VStack,
	ExternalLink,
	ComboboxControl,
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
import { availableLanguages } from '../../data/languages';
import { UserSettingsPreferences } from '../../data/me-user-preferences';
import type { Field } from '@wordpress/dataviews';
import './style.scss';

const languageForm = {
	type: 'regular' as const,
	labelPosition: 'top' as const,
	fields: [
		{
			id: 'interfaceLanguage',
			label: __( 'Language' ),
			children: [ 'language', 'enable_translator' ],
		},
	],
};

export default function Preferences() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: serverData } = useQuery( userPreferencesQuery() );
	const [ localData, setLocalData ] = useState< Partial< UserSettingsPreferences > | undefined >();
	const [ savingData, setSavingData ] = useState<
		Partial< UserSettingsPreferences > | undefined
	>();
	const data = useMemo(
		() => ( serverData ? { ...serverData, ...savingData, ...localData } : undefined ),
		[ serverData, savingData, localData ]
	);
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

	const langValue = data && data.language ? data.language : 'en';
	const selectedLanguageLabel =
		availableLanguages.find( ( opt ) => opt.value === langValue )?.label || langValue;

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
			Edit: ( { field, data, onChange } ) => {
				return (
					<>
						{ /* TODO validate it, it should be required */ }
						<ComboboxControl
							value={ field.getValue( { item: data } ) ?? '' }
							label={ __( 'Interface language' ) }
							onChange={ ( newValue ) => {
								onChange( {
									[ field.id ]: newValue,
								} );
							} }
							options={ availableLanguages }
						/>
						<Text variant="muted">
							{ __(
								'This is the language of the interface you see across WordPress.com as a whole.'
							) }
							<br />
							{ createInterpolateElement(
								// TODO reimplement logic https://github.com/Automattic/wp-calypso/blob/fbeb9c37266e2bfac7af881b1672a9f6d72a0670/client/me/account/main.jsx#L299
								sprintf(
									/* translators: %s: selected interface language */
									__(
										'Thanks to all our <external>community members who helped translate to %s</external>'
									),
									selectedLanguageLabel
								),
								{
									external: (
										<ExternalLink
											href={ `https://translate.wordpress.com/translators/?contributor_locale=${ langValue }` }
										/>
									),
								}
							) }
						</Text>
					</>
				);
			},
			elements: availableLanguages,
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
		},
		// TODO we might also need to add the empathy mode and the incomplete locale control https://github.com/Automattic/wp-calypso/blob/fbeb9c37266e2bfac7af881b1672a9f6d72a0670/client/components/language-picker/modal.tsx#L118
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
									//errors={ errors } // TODO support errors
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
										isBusy={ isSaving }
										disabled={ isSaving || ! isDirty }
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

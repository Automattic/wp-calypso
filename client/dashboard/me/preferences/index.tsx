import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useMemo, useState, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	userPreferencesMutation,
	userPreferencesQuery,
} from '../../app/queries/me-user-preferences';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { availableLanguages } from '../../data/languages';
import { UserSettingsPreferences } from '../../data/me-user-preferences';
import type { Field } from '@wordpress/dataviews';

const form = {
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
			onSettled: () => setSavingData( undefined ),
			onError: () => {
				// Prepend previous attempted data back into local edits
				setLocalData( ( current ) => ( { ...mutationData, ...current } ) );
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

	const fields: Field< UserSettingsPreferences >[] = [
		{
			id: 'language',
			label: __( 'Interface language' ),
			type: 'text',
			description: sprintf(
				/* translators: %s: selected interface language */
				__(
					'This is the language of the interface you see across WordPress.com as a whole. Thanks to all our community members who helped translate to %s'
				),
				selectedLanguageLabel
			),
			elements: availableLanguages,
		},
		{
			Edit: 'checkbox',
			id: 'enable_translator',
			label: 'Enable the in-page translator where available',
			// @ts-expect-error children prop is injected by createInterpolateElement TODO Fix me
			description: createInterpolateElement(
				__( 'This allows you to help translate WordPress.com. <external>Learn more</external>' ),
				{
					// @ts-expect-error children prop is injected by createInterpolateElement TODO Fix me
					external: <ExternalLink href="https://translate.wordpress.com/community-translator/" />,
				}
			),
			type: 'boolean',
		},
	];

	return (
		<>
			<form onSubmit={ handleSubmit }>
				<PageLayout size="small" header={ <PageHeader title={ __( 'Preferences' ) } /> }>
					<Card>
						<CardBody>
							<VStack spacing={ 6 } alignment="left">
								<DataForm< UserSettingsPreferences >
									data={ data }
									fields={ fields }
									form={ form }
									//errors={ errors }
									onChange={ ( edits: Partial< UserSettingsPreferences > ) => {
										setLocalData( ( current ) => ( { ...current, ...edits } ) );
									} }
								/>
								{ /**{ mutation.error && (
									<Notice status="error" isDismissible={ false }>
										{ mutation.error.message }
									</Notice>
								) }*/ }
								<Button variant="primary" type="submit">
									{ saveButtonLabel }
								</Button>
							</VStack>
						</CardBody>
					</Card>
				</PageLayout>
			</form>
		</>
	);
}

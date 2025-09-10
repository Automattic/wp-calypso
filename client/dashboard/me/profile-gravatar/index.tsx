import { userSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	ExternalLink,
	TextareaControl,
	BaseControl,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { SectionHeader } from '../../components/section-header';
import EditGravatar from './edit-gravatar';
import GravatarLogo from './gravatar-logo';
import type { UserSettings } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';

interface GravatarProfileSectionProps {
	profile: UserSettings;
}

const fields: Field< UserSettings >[] = [
	{
		id: 'avatar_URL',
		label: __( 'Avatar' ),
		type: 'text',
		Edit: ( { field, data, hideLabelFromVision } ) => {
			return (
				<BaseControl
					label={ field.label }
					hideLabelFromVision={ hideLabelFromVision }
					__nextHasNoMarginBottom
				>
					<EditGravatar avatarUrl={ data.avatar_URL } userEmail={ data.user_email } />
				</BaseControl>
			);
		},
	},
	{ id: 'display_name', label: __( 'Display name' ), type: 'text' },
	{ id: 'user_URL', label: __( 'Web address' ), type: 'text' },
	{
		id: 'description',
		label: __( 'About me' ),
		type: 'text',
		Edit: ( { field, data, onChange, hideLabelFromVision } ) => (
			<TextareaControl
				__nextHasNoMarginBottom
				label={ hideLabelFromVision ? '' : field.label }
				value={ data.description }
				onChange={ ( value: string ) => onChange( { description: value } ) }
			/>
		),
	},
];

const form: Form = {
	layout: { type: 'regular' as const, labelPosition: 'top' as const },
	fields: [
		{ id: 'gravatar', children: [ 'avatar_URL', 'display_name', 'user_URL', 'description' ] },
	],
};

// Derive controlled keys from fields, excluding avatar_URL since it's not editable
const controlledKeys = fields
	.filter( ( field ) => field.id !== 'avatar_URL' )
	.map( ( field ) => field.id );

export default function GravatarProfileSection( {
	profile: serverProfile,
}: GravatarProfileSectionProps ) {
	const [ edits, setEdits ] = useState< Partial< UserSettings > >( {} );
	const data = useMemo( () => ( { ...serverProfile, ...edits } ), [ serverProfile, edits ] );
	const mutation = useMutation( userSettingsMutation() );
	const isSaving = mutation.isPending;
	const isDirty = controlledKeys.some(
		( key ) => data[ key as keyof UserSettings ] !== serverProfile[ key as keyof UserSettings ]
	);

	const onChange = ( partial: Partial< UserSettings > ) => {
		setEdits( ( current ) => ( { ...current, ...partial } ) );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! edits || Object.keys( edits ).length === 0 ) {
			return;
		}

		mutation.mutate( edits, { onSuccess: () => setEdits( {} ) } );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							decoration={ <GravatarLogo /> }
							level={ 3 }
							title={ __( 'Public Gravatar profile' ) }
						/>

						<Text>
							{ createInterpolateElement(
								sprintf(
									/* translators: %1$s: User email */
									__(
										'Your WordPress profile is linked to Gravatar, making your Gravatar public by default. It might appear on other sites using Gravatar when logged in with <strong>%s</strong>. Manage your Gravatar settings on your <external>Gravatar profile</external>.'
									),
									data.user_email
								),
								{
									strong: <strong />,
									// @ts-expect-error children prop is injected by createInterpolateElement
									external: <ExternalLink href="https://gravatar.com" />,
								}
							) }
						</Text>

						<DataForm< UserSettings >
							data={ data }
							fields={ fields }
							form={ form }
							onChange={ onChange }
						/>

						{ mutation.error && <Text>{ ( mutation.error as Error ).message }</Text> }

						<HStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! isDirty }
							>
								{ __( 'Save' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</form>
	);
}

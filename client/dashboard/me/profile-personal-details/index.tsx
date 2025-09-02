import { profileMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	CheckboxControl,
	Notice,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { SectionHeader } from '../../components/section-header';
import type { UserProfile } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';

const fields: Field< UserProfile >[] = [
	{
		id: 'first_name',
		label: __( 'First name' ),
		type: 'text',
	},
	{
		id: 'last_name',
		label: __( 'Last name' ),
		type: 'text',
	},
	{
		id: 'user_login',
		label: __( 'Username' ),
		type: 'text',
		Edit: ( { field, data, hideLabelFromVision } ) => {
			const { getValue } = field;
			return (
				<InputControl
					__next40pxDefaultSize
					label={ hideLabelFromVision ? '' : field.label }
					value={ getValue( { item: data } ) }
					disabled
					onChange={ () => {} }
				/>
			);
		},
	},
	{
		id: 'user_email',
		label: __( 'Email address' ),
		type: 'email',
	},
	{
		id: 'is_dev_account',
		label: __( 'I am a developer' ),
		type: 'boolean',
		description: __( 'Opt me into previews of new developer-focused features.' ),
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue, description } = field;
			return (
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : field.label }
					help={ description }
					checked={ getValue( { item: data } ) }
					onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
				/>
			);
		},
	},
];

const form: Form = {
	layout: {
		type: 'regular' as const,
		labelPosition: 'top' as const,
	},
	fields: [ 'first_name', 'last_name', 'user_login', 'user_email', 'is_dev_account' ],
};

interface PersonalDetailsSectionProps {
	profile: UserProfile;
}

// excluding user_login since it's read-only
const controlledKeys = fields
	.filter( ( field ) => field.id !== 'user_login' )
	.map( ( field ) => field.id );

export default function PersonalDetailsSection( {
	profile: serverProfile,
}: PersonalDetailsSectionProps ) {
	const [ edits, setEdits ] = useState< Partial< UserProfile > >( {} );
	const data = useMemo( () => ( { ...serverProfile, ...edits } ), [ serverProfile, edits ] );
	const mutation = useMutation( profileMutation() );
	const isSaving = mutation.isPending;
	const isDirty = controlledKeys.some( ( key ) => {
		return data?.[ key as keyof UserProfile ] !== serverProfile?.[ key as keyof UserProfile ];
	} );

	function onChange( partial: Partial< UserProfile > ) {
		setEdits( ( current ) => ( { ...current, ...partial } ) );
	}

	function handleSubmit( e: React.FormEvent ) {
		e.preventDefault();

		if ( ! edits || Object.keys( edits ).length === 0 ) {
			return;
		}

		mutation.mutate( edits, { onSuccess: () => setEdits( {} ) } );
	}

	return (
		<form onSubmit={ handleSubmit }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ __( 'Personal details' ) } />

						<DataForm< UserProfile >
							data={ data }
							fields={ fields }
							form={ form }
							onChange={ onChange }
						/>

						{ mutation.error && (
							<Notice status="error" isDismissible={ false }>
								{ ( mutation.error as Error ).message }
							</Notice>
						) }

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

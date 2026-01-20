import { userSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import { GravatarLogo } from '@automattic/components/src/logos/gravatar-logo';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	TextareaControl,
	BaseControl,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useRef } from 'react';
import { isValidUrl } from '../../../lib/importer/url-validation';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import EditGravatar from './edit-gravatar';
import type { EditGravatarHandle } from './edit-gravatar';
import type { UserSettings } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';

import './style.scss';

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
	{
		id: 'display_name',
		label: __( 'Display name' ),
		type: 'text',
		isValid: {
			custom: ( item ) => {
				const value = item.display_name;
				if ( value && value.length > 250 ) {
					return __( 'Display name must be 250 characters or less.' );
				}
				return null;
			},
		},
	},
	{
		id: 'user_URL',
		label: __( 'Web address' ),
		type: 'text',
		isValid: {
			custom: ( item ) => {
				const value = item.user_URL?.trim();
				if ( value && ! isValidUrl( value ) ) {
					return __( 'Please enter a valid URL.' );
				}
				return null;
			},
		},
	},
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
	fields: [ 'display_name', 'user_URL', 'description' ],
};

// Derive controlled keys from fields, excluding avatar_URL since it's not editable
const controlledKeys = fields
	.filter( ( field ) => field.id !== 'avatar_URL' )
	.map( ( field ) => field.id );

export default function GravatarProfileSection() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const editGravatarRef = useRef< EditGravatarHandle >( null );

	const [ edits, setEdits ] = useState< Partial< UserSettings > >( {} );
	const data = useMemo( () => ( { ...userSettings, ...edits } ), [ userSettings, edits ] );
	const mutation = useMutation( userSettingsMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const isSaving = mutation.isPending;
	const isDirty = controlledKeys.some(
		( key ) => data[ key as keyof UserSettings ] !== userSettings[ key as keyof UserSettings ]
	);
	const { validity, isValid } = useFormValidity( data, fields, form );

	const onChange = ( partial: Partial< UserSettings > ) => {
		setEdits( ( current ) => ( { ...current, ...partial } ) );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! edits || Object.keys( edits ).length === 0 ) {
			return;
		}

		if ( ! isValid ) {
			return;
		}

		mutation.mutate( edits, {
			onSuccess: () => {
				setEdits( {} );
				createSuccessNotice( __( 'Public Gravatar profile saved successfully.' ), {
					type: 'snackbar',
				} );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to save public Gravatar profile.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ __( 'Public profile' ) } />
						<HStack className="gravatar-profile" spacing={ 3 } alignment="center">
							<button
								type="button"
								className="gravatar-profile__avatar"
								onClick={ () => editGravatarRef.current?.open() }
								aria-label={ __( 'Edit avatar on Gravatar' ) }
							>
								<img src={ data.avatar_URL } alt={ __( 'User avatar' ) } />
							</button>
							<div className="gravatar-profile__text">
								<p>
									{ __(
										'Updating your avatar, name, and about info here will also update it across all sites that use Gravatar.'
									) }
								</p>
								<span className="gravatar-profile__link-row">
									<GravatarLogo
										className="gravatar-profile__logo"
										fill="#3858E9"
										size={ 16 }
										aria-hidden="true"
									/>
									<ExternalLink href="https://support.gravatar.com/basic/what-is-gravatar/">
										{ __( 'What is Gravatar?' ) }
									</ExternalLink>
								</span>
							</div>
							<EditGravatar
								ref={ editGravatarRef }
								avatarUrl={ data.avatar_URL }
								userEmail={ data.user_email }
								showAvatarPreview={ false }
							/>
						</HStack>

						<NavigationBlocker shouldBlock={ isDirty } />
						<DataForm< UserSettings >
							data={ data }
							fields={ fields }
							validity={ validity }
							form={ form }
							onChange={ onChange }
						/>

						{ mutation.error && <Text>{ ( mutation.error as Error ).message }</Text> }

						<HStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! isDirty || ! isValid }
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

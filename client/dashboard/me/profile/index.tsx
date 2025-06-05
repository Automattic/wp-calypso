import { DataForm } from '@automattic/dataviews';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	CheckboxControl,
	Notice,
	TextareaControl,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
	TextControl,
} from '@wordpress/components';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { profileQuery, profileMutation } from '../../app/queries';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import EditGravatar from '../edit-gravatar';
import type { Profile as ProfileType } from '../../data/types';
import type { Field } from '@automattic/dataviews';

import './style.scss';

const fields: Field< ProfileType >[] = [
	{
		id: 'user_login',
		label: __( 'Username' ),
		type: 'text',
		Edit: ( { field, data, hideLabelFromVision } ) => {
			const { getValue } = field;
			return (
				<TextControl
					__nextHasNoMarginBottom
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
		id: 'display_name',
		label: __( 'Public display name' ),
		type: 'text',
	},
	{
		id: 'user_email',
		label: __( 'Email' ),
		type: 'text',
	},
	{
		id: 'user_URL',
		label: __( 'Public web address' ),
		type: 'text',
	},
	{
		id: 'description',
		label: __( 'About me' ),
		type: 'text',
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue } = field;
			return (
				<TextareaControl
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : field.label }
					value={ getValue( { item: data } ) || '' }
					onChange={ ( value ) => onChange( { [ id ]: value } ) }
					rows={ 4 }
				/>
			);
		},
	},
	{
		id: 'is_dev_account',
		label: __( 'I am a developer' ),
		// To do: replace with boolean once implemented.
		type: 'integer',
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

const form = {
	type: 'regular' as const,
	labelPosition: 'top' as const,
	fields: [
		{
			id: 'personalInfo',
			label: __( 'Personal Information' ),
			children: [ 'user_login', 'display_name', 'user_email', 'user_URL', 'description' ],
		},
		{
			id: 'developerOptions',
			label: __( 'Developer options' ),
			children: [ 'is_dev_account' ],
		},
	],
};

export default function Profile() {
	const { data: serverData } = useQuery( profileQuery() );
	const [ localData, setLocalData ] = useState< Partial< ProfileType > | undefined >();
	const [ savingData, setSavingData ] = useState< Partial< ProfileType > | undefined >();
	const data = useMemo(
		() => ( serverData ? { ...serverData, ...savingData, ...localData } : undefined ),
		[ serverData, savingData, localData ]
	);
	const mutation = useMutation( profileMutation() );

	if ( ! data ) {
		return;
	}

	const isSaving = mutation.isPending;
	const isDirty =
		!! localData &&
		!! serverData &&
		Object.entries( localData ).some( ( [ key, value ] ) => {
			return serverData[ key as keyof ProfileType ] !== value;
		} );
	let saveButtonLabel = __( 'Save' );

	if ( isSaving ) {
		saveButtonLabel = __( 'Saving…' );
	} else if ( mutation.isSuccess && ! isDirty ) {
		saveButtonLabel = __( 'Saved!' );
	}

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( localData ) {
			// Set a local ref, because onError might called synchronously, and
			// setSavingData is async.
			const mutationData = localData;
			// Clear the local data, so new edits start fresh.
			setLocalData( undefined );
			// Set saving state, so the data shown until settling is correct.
			setSavingData( mutationData );
			mutation.mutate( mutationData, {
				onSettled: () => {
					setSavingData( undefined );
				},
				onError: () => {
					// Prepend the data to the local data on error.
					setLocalData( ( currentData ) => ( { ...mutationData, ...currentData } ) );
				},
			} );
		}
	};

	return (
		<>
			<form onSubmit={ handleSubmit }>
				<PageLayout
					size="small"
					header={
						<PageHeader
							title={ __( 'Profile' ) }
							description={
								<>
									{ __( 'Set your name, bio, and other public-facing information.' ) }{ ' ' }
									<ExternalLink href="#learn-more">{ __( 'Learn more' ) }</ExternalLink>
								</>
							}
						/>
					}
				>
					<Card>
						<CardBody>
							<HStack justify="flex-start" spacing={ 8 }>
								<div>
									<EditGravatar avatarUrl={ data.avatar_URL } userEmail={ data.user_email } />
								</div>
								<div>
									<Text>{ __( 'This is your profile photo.' ) }</Text>
									<br />
									<Text variant="muted">
										{ __( 'It appears when you comment on other blogs.' ) }
									</Text>
								</div>
							</HStack>
						</CardBody>
					</Card>

					<Card>
						<CardBody>
							<VStack spacing={ 4 } alignment="left">
								<DataForm< ProfileType >
									data={ data }
									fields={ fields }
									form={ form }
									onChange={ ( edits: Partial< ProfileType > ) => {
										setLocalData( ( current ) => ( { ...current, ...edits } ) );
									} }
								/>

								{ mutation.error && (
									<Notice status="error" isDismissible={ false }>
										{ mutation.error.message }
									</Notice>
								) }

								<Button
									variant="primary"
									type="submit"
									isBusy={ isSaving }
									disabled={ isSaving || ! isDirty }
								>
									{ saveButtonLabel }
								</Button>
							</VStack>
						</CardBody>
					</Card>

					<div>
						<Heading id="learn-more" level={ 3 }>
							{ __( 'About your profile' ) }
						</Heading>
						<p className="dasboard-profile__text">
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
						</p>
					</div>
				</PageLayout>
			</form>
		</>
	);
}

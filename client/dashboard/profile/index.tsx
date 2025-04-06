import { useMutation } from '@tanstack/react-query';
import { useLoaderData } from '@tanstack/react-router';
import {
	Button,
	Card,
	CardBody,
	CheckboxControl,
	Notice,
	TextareaControl,
	__experimentalText as Text,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import AsyncLoad from '../async-load';
import { updateProfile } from '../data';
import EditGravatar from '../edit-gravatar';
import PageLayout from '../page-layout';
import type { User } from '../data/types';
import type { Field, Form } from '@wordpress/dataviews';

const fields = [
	{
		id: 'user_login',
		label: __( 'Username' ),
		type: 'text',
	},
	{
		id: 'display_name',
		label: __( 'Display name' ),
		type: 'text',
	},
	{
		id: 'user_email',
		label: __( 'Email' ),
		type: 'text',
	},
	{
		id: 'user_URL',
		label: __( 'Site Address' ),
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
					label={ hideLabelFromVision ? '' : field.label }
					value={ getValue( { item: data } ) || '' }
					onChange={ ( value ) => onChange( { [ id ]: value } ) }
					rows={ 4 }
				/>
			);
		},
	},
	{
		id: 'isDeveloper',
		label: __( 'I am a developer' ),
		type: 'integer',
		description: __( 'Opt me into previews of new developer-focused features.' ),
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue, description } = field;
			return (
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : field.label }
					help={ description }
					checked={ Boolean( getValue( { item: data } ) ) }
					onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) ? 1 : 0 } ) }
				/>
			);
		},
	},
] as Field< User >[];

const form = {
	type: 'regular',
	labelPosition: 'top',
	fields: [
		{
			id: 'personalInfo',
			label: __( 'Personal Information' ),
			children: [ 'user_login', 'display_name', 'user_email', 'user_URL', 'description' ],
		},
		{
			id: 'developerOptions',
			label: __( 'Developer options' ),
			children: [ 'isDeveloper' ],
		},
	],
} as Form;

function Profile() {
	const mutation = useMutation( { mutationFn: updateProfile } );
	const serverData = useLoaderData( { from: '/me' } ) as User;
	const [ localFormData, setLocalFormData ] = useState< Partial< User > | undefined >();

	const data = useMemo( () => {
		if ( ! localFormData ) {
			return serverData;
		}
		return { ...serverData, ...localFormData };
	}, [ localFormData, serverData ] );

	const isSaving = mutation.isPending;
	const error = mutation.error;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( localFormData ) {
			mutation.mutate( localFormData );
		}
	};

	// Handle case where there's an error fetching data
	const errorMessage = error instanceof Error ? error.message : String( error );

	return (
		<>
			{ twoStepAuthorization.isReauthRequired() && (
				<AsyncLoad
					require="calypso/dashboard/reauth-required"
					twoStepAuthorization={ twoStepAuthorization }
				/>
			) }
			<form onSubmit={ handleSubmit }>
				<PageLayout
					title={ __( 'Profile' ) }
					description={
						<>
							{ __( 'Set your name, bio, and other public-facing information.' ) }
							<Button href="#learn-more" variant="link">
								{ __( 'Learn more' ) }
							</Button>
						</>
					}
				>
					{ error && (
						<Card>
							<Notice status="error" isDismissible={ false }>
								{ errorMessage }
							</Notice>
						</Card>
					) }

					<Card>
						<CardBody>
							<HStack justify="flex-start">
								<div>
									<EditGravatar avatarUrl={ data.avatar_URL } userEmail={ data.user_email } />
								</div>
								<div>
									<Text>{ __( 'This is your profile photo.' ) }</Text>
									<Text variant="muted">
										{ __( 'It appears when you comment on other blogs.' ) }
									</Text>
								</div>
							</HStack>
						</CardBody>
					</Card>

					<Card>
						<CardBody>
							<DataForm< User >
								data={ data }
								fields={ fields }
								form={ form }
								onChange={ ( edits ) => {
									setLocalFormData( ( current ) => ( {
										...current,
										...edits,
									} ) );
								} }
							/>
						</CardBody>
					</Card>

					<Card>
						<CardBody>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! localFormData }
							>
								{ __( 'Save' ) }
							</Button>
						</CardBody>
					</Card>
				</PageLayout>
			</form>
		</>
	);
}

export default Profile;

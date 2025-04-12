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
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useState, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { updateProfile } from '../data';
import EditGravatar from '../edit-gravatar';
import PageLayout from '../page-layout';
import type { Profile as ProfileType } from '../data/types';
import type { Field, Form } from '@wordpress/dataviews';
import './style.scss';

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
] as Field< ProfileType >[];

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
	const serverData = useLoaderData( { from: '/me' } ) as ProfileType;
	const [ data, setData ] = useState< ProfileType >( serverData );
	const isSaving = mutation.isPending;
	const isDirty = data !== serverData;
	const error = mutation.error;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( isDirty ) {
			mutation.mutate( data );
		}
	};

	// Handle case where there's an error fetching data
	const errorMessage = error instanceof Error ? error.message : String( error );

	return (
		<>
			<form onSubmit={ handleSubmit }>
				<PageLayout
					title={ __( 'Profile' ) }
					description={
						<>
							{ __( 'Set your name, bio, and other public-facing information.' ) }{ ' ' }
							<ExternalLink href="#learn-more">{ __( 'Learn more' ) }</ExternalLink>
						</>
					}
					size="small"
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
							<VStack spacing={ 4 } alignment="left">
								<DataForm< ProfileType >
									data={ data }
									fields={ fields }
									form={ form }
									onChange={ ( edits ) => {
										setData( ( current ) => ( {
											...current,
											...edits,
										} ) );
									} }
								/>

								<Button
									variant="primary"
									type="submit"
									isBusy={ isSaving }
									disabled={ isSaving || ! isDirty }
								>
									{ __( 'Save' ) }
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
										'Your WordPress profile is linked to Gravatar, making your Gravatar public by default. It might appear on other sites using Gravatar when loggend in with <strong>%s</strong>. Manage your Gravatar settings on your <external>Gravatar profile</external>.'
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

export default Profile;

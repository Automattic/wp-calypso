import {
	Button,
	Card,
	CardBody,
	CheckboxControl,
	Flex,
	FlexBlock,
	FlexItem,
	Notice,
	TextareaControl,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLoaderData, useFetcher } from 'react-router-dom';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from '../auth/reauth-required';
import EditGravatar from '../edit-gravatar';
import PageLayout from '../page-layout';
import type { ProfileObject } from '../data';
import type { Field, Form } from '@wordpress/dataviews';

function Profile() {
	const fetcher = useFetcher();
	const serverData = useLoaderData() as ProfileObject;
	const [ localFormData, setLocalFormData ] = useState< Partial< ProfileObject > | undefined >();

	const data = useMemo( () => {
		if ( ! localFormData ) {
			return serverData;
		}
		return { ...serverData, ...localFormData };
	}, [ localFormData, serverData ] );

	// Remove the mutation related code and use fetcher state
	const isSaving = fetcher.state === 'submitting';
	const error = fetcher.data?.error;

	// Define fields for the DataForm
	const fields = useMemo(
		() =>
			[
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
			] as Field< ProfileObject >[],
		[]
	);

	// Define form layout
	const form = useMemo(
		() =>
			( {
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
			} ) as Form,
		[]
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		fetcher.submit( JSON.stringify( localFormData ), {
			method: 'post',
			encType: 'application/json',
		} );
	};

	// Handle case where there's an error fetching data
	const errorMessage = error instanceof Error ? error.message : String( error );

	return (
		<>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
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
							<Flex gap={ 3 }>
								<FlexItem>
									<EditGravatar avatarUrl={ data.avatar_URL } userEmail={ data.user_email } />
								</FlexItem>
								<FlexBlock>
									<Text>{ __( 'This is your profile photo.' ) }</Text>
									<Text variant="muted">
										{ __( 'It appears when you comment on other blogs.' ) }
									</Text>
								</FlexBlock>
							</Flex>
						</CardBody>
					</Card>

					<Card>
						<CardBody>
							<DataForm< ProfileObject >
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

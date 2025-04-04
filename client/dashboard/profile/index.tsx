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
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useMemo, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useLoaderData, useFetcher } from 'react-router-dom';
import type { ProfileObject } from '../data';
import type { Field, Form } from '@wordpress/dataviews';

function Profile() {
	const translate = useTranslate();
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
					label: translate( 'USERNAME' ),
					type: 'text',
				},
				{
					id: 'display_name',
					label: translate( 'DISPLAY NAME' ),
					type: 'text',
				},
				{
					id: 'user_email',
					label: translate( 'EMAIL ADDRESS' ),
					type: 'text',
				},
				{
					id: 'user_URL',
					label: translate( 'SITE ADDRESS' ),
					type: 'text',
				},
				{
					id: 'description',
					label: translate( 'ABOUT ME' ),
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
					label: translate( 'I am a developer' ),
					type: 'integer',
					description: translate( 'Opt me into previews of new developer-focused features.' ),
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
		[ translate ]
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
						label: translate( 'Personal Information' ),
						children: [ 'user_login', 'display_name', 'user_email', 'user_URL', 'description' ],
					},
					{
						id: 'developerOptions',
						label: translate( 'Developer options' ),
						children: [ 'isDeveloper' ],
					},
				],
			} ) as Form,
		[ translate ]
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
		<Flex direction="column" gap={ 4 }>
			<div>
				<Heading level={ 1 } style={ { marginBottom: 8 } }>
					{ translate( 'Profile' ) }
				</Heading>
				<Text>
					{ translate( 'Set your name, bio, and other public-facing information.' ) }
					<Button href="#learn-more" variant="link">
						{ translate( 'Learn more' ) }
					</Button>
				</Text>
			</div>

			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ errorMessage }
				</Notice>
			) }

			<form onSubmit={ handleSubmit }>
				<Flex direction="column" gap={ 3 }>
					<Card>
						<CardBody>
							<Flex gap={ 3 }>
								<FlexItem>
									<img
										src="/calypso/images/gravatar/user-img.svg"
										alt={ translate( 'Profile photo' ) }
										style={ { width: 80, height: 80, borderRadius: '50%' } }
									/>
								</FlexItem>
								<FlexBlock>
									<Text>{ translate( 'This is your profile photo.' ) }</Text>
									<Text variant="muted">
										{ translate( 'It appears when you comment on other blogs.' ) }
									</Text>
								</FlexBlock>
							</Flex>
						</CardBody>
					</Card>

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

					<Card>
						<CardBody>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! localFormData }
							>
								{ translate( 'Save' ) }
							</Button>
						</CardBody>
					</Card>
				</Flex>
			</form>
		</Flex>
	);
}

export default Profile;

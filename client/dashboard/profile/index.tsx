import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CheckboxControl,
	Flex,
	FlexBlock,
	FlexItem,
	Notice,
	TextControl,
	TextareaControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useLoaderData } from 'react-router-dom';
import wpcom from 'calypso/lib/wp';
import { fetchProfile } from '../data/index';
import type { LoaderFunction } from 'react-router-dom';
interface ProfileData {
	username: string;
	displayName: string;
	email: string;
	siteAddress: string;
	aboutMe: string;
	isDeveloper: boolean;
}

async function updateProfile( data: ProfileData ): Promise< void > {
	try {
		await wpcom.req.post( {
			path: '/users/me',
			apiNamespace: 'wp/v2',
			body: {
				username: data.username,
				name: data.displayName,
				email: data.email,
				url: data.siteAddress,
				description: data.aboutMe,
				meta: {
					is_developer: data.isDeveloper,
				},
			},
		} );
	} catch ( error ) {
		throw new Error( 'Failed to save profile data' );
	}
}

function Profile() {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const queryProfileData = useLoaderData() as ProfileData;

	const {
		mutate: saveProfile,
		isPending: isSaving,
		error: saveError,
	} = useMutation( {
		mutationFn: updateProfile,
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'profile' ] } );
		},
	} );

	const [ formData, setFormData ] = useState< ProfileData >( {
		username: '',
		displayName: '',
		email: '',
		siteAddress: '',
		aboutMe: '',
		isDeveloper: false,
	} );

	// Update form data when profile data is loaded
	useEffect( () => {
		if ( queryProfileData ) {
			setFormData( queryProfileData );
		}
	}, [ queryProfileData ] );

	const handleChange = ( field: string ) => ( value: string | boolean ) => {
		setFormData( ( prev ) => ( {
			...prev,
			[ field ]: value,
		} ) );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		saveProfile( formData );
	};

	// Handle case where there's an error fetching data but we want to show the form anyway
	const error = saveError;
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

					<Card>
						<CardBody>
							<Flex direction="column" gap={ 4 }>
								<Flex gap={ 3 }>
									<FlexBlock>
										<TextControl
											label={ translate( 'USERNAME' ) }
											value={ formData.username }
											onChange={ handleChange( 'username' ) }
											disabled={ isSaving }
										/>
									</FlexBlock>
									<FlexBlock>
										<TextControl
											label={ translate( 'DISPLAY NAME' ) }
											value={ formData.displayName }
											onChange={ handleChange( 'displayName' ) }
											disabled={ isSaving }
										/>
									</FlexBlock>
								</Flex>

								<Flex gap={ 3 }>
									<FlexBlock>
										<TextControl
											label={ translate( 'EMAIL ADDRESS' ) }
											type="email"
											value={ formData.email }
											onChange={ handleChange( 'email' ) }
											disabled={ isSaving }
										/>
									</FlexBlock>
									<FlexBlock>
										<TextControl
											label={ translate( 'SITE ADDRESS' ) }
											type="url"
											value={ formData.siteAddress }
											onChange={ handleChange( 'siteAddress' ) }
											disabled={ isSaving }
										/>
									</FlexBlock>
								</Flex>

								<TextareaControl
									label={ translate( 'ABOUT ME' ) }
									value={ formData.aboutMe }
									onChange={ handleChange( 'aboutMe' ) }
									disabled={ isSaving }
								/>

								<Button variant="primary" type="submit" isBusy={ isSaving } disabled={ isSaving }>
									{ translate( 'Save' ) }
								</Button>
							</Flex>
						</CardBody>
					</Card>

					<Card>
						<CardHeader>
							<Heading level={ 2 }>{ translate( 'Developer options' ) }</Heading>
						</CardHeader>
						<CardBody>
							<Flex direction="column" gap={ 3 }>
								<CheckboxControl
									label={ translate( 'I am a developer' ) }
									help={ translate( 'Opt me into previews of new developer-focused features.' ) }
									checked={ formData.isDeveloper }
									onChange={ handleChange( 'isDeveloper' ) }
									disabled={ isSaving }
								/>
								<Button variant="primary" type="submit" isBusy={ isSaving } disabled={ isSaving }>
									{ translate( 'Save' ) }
								</Button>
							</Flex>
						</CardBody>
					</Card>
				</Flex>
			</form>
		</Flex>
	);
}

Profile.loader = fetchProfile satisfies LoaderFunction;

export default Profile;

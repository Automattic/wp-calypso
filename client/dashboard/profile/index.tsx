import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Card,
	CardHeader,
	Flex,
	FlexItem,
	Notice,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import type { Field, Form } from '@wordpress/dataviews';

interface ProfileData {
	username: string;
	displayName: string;
	email: string;
	siteAddress: string;
	aboutMe: string;
	isDeveloper: boolean;
}

async function fetchProfile(): Promise< ProfileData > {
	try {
		const data = await wpcom.req.get( {
			path: '/me?http_envelope=1',
			apiNamespace: 'rest/v1.1',
		} );
		return {
			username: data.username || '',
			displayName: data.name || '',
			email: data.email || '',
			siteAddress: data.url || '',
			aboutMe: data.description || '',
			isDeveloper: Boolean( data.meta?.is_developer ),
		};
	} catch ( error ) {
		throw new Error( 'Failed to fetch profile data' );
	}
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

export default function Profile() {
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const {
		data: profileData,
		error: fetchError,
		isLoading,
	} = useQuery( {
		queryKey: [ 'profile' ],
		queryFn: fetchProfile,
	} );

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

	// Define form fields
	const fields = useMemo(
		() =>
			[
				{
					id: 'username',
					label: translate( 'Username' ),
					type: 'text',
				},
				{
					id: 'displayName',
					label: translate( 'Display Name' ),
					type: 'text',
				},
				{
					id: 'email',
					label: translate( 'Email Address' ),
					type: 'text',
				},
				{
					id: 'siteAddress',
					label: translate( 'Site Address' ),
					type: 'text',
				},
				{
					id: 'aboutMe',
					label: translate( 'About Me' ),
					type: 'text',
					Edit: 'textarea',
				},
				{
					id: 'isDeveloper',
					label: translate( 'I am a developer' ),
					type: 'boolean',
					help: translate( 'Opt me into previews of new developer-focused features.' ),
				},
			] as Field< ProfileData >[],
		[ translate ]
	);

	// Define form structure
	const form = useMemo(
		() =>
			( {
				type: 'panel',
				labelPosition: 'top',
				fields: [
					{
						id: 'profile',
						label: translate( 'Basic Information' ),
						children: [ 'username', 'displayName', 'email', 'siteAddress' ],
					},
					{
						id: 'about',
						label: translate( 'About Me' ),
						children: [ 'aboutMe' ],
					},
					{
						id: 'developer',
						label: translate( 'Developer Options' ),
						children: [ 'isDeveloper' ],
					},
				],
			} ) as Form,
		[ translate ]
	);

	if ( isLoading ) {
		return (
			<Flex justify="center" align="center" style={ { minHeight: '400px' } }>
				<Spinner />
			</Flex>
		);
	}

	// Handle case where there's an error fetching data
	const error = fetchError || saveError;
	const errorMessage = error instanceof Error ? error.message : String( error );

	return (
		<Flex direction="column" gap={ 4 }>
			<div>
				<Heading level={ 1 } style={ { marginBottom: 8 } }>
					{ translate( 'Profile' ) }
				</Heading>
				<Text>{ translate( 'Set your name, bio, and other public-facing information.' ) }</Text>
			</div>

			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ errorMessage }
				</Notice>
			) }

			<Card>
				<CardHeader>
					<Flex gap={ 3 }>
						<FlexItem>
							<img
								src="/calypso/images/gravatar/user-img.svg"
								alt={ translate( 'Profile photo' ) }
								style={ { width: 80, height: 80, borderRadius: '50%' } }
							/>
						</FlexItem>
						<div>
							<Text>{ translate( 'This is your profile photo.' ) }</Text>
							<Text variant="muted">
								{ translate( 'It appears when you comment on other blogs.' ) }
							</Text>
						</div>
					</Flex>
				</CardHeader>
			</Card>

			{ profileData && (
				<DataForm< ProfileData >
					data={ profileData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< ProfileData > ) => {
						// Only save when all edits are done
						const newData = { ...profileData, ...edits };
						saveProfile( newData );
					} }
					isLoading={ isSaving }
				/>
			) }
		</Flex>
	);
}

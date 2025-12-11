import { userPreferencesMutation, rawUserPreferencesQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { ButtonStack } from '../../components/button-stack/';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';

type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

interface DefaultLandingPreferencesFormData {
	defaultLandingPage: LandingPage;
}

export default function PreferencesDefaultLanding() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: defaultLandingPage } = useSuspenseQuery( {
		...rawUserPreferencesQuery(),
		select: ( preferences ): LandingPage => {
			if ( preferences[ 'sites-landing-page' ]?.useSitesAsLandingPage ) {
				return 'sites';
			}
			if ( preferences[ 'reader-landing-page' ]?.useReaderAsLandingPage ) {
				return 'reader';
			}
			return 'primary-site-dashboard';
		},
	} );

	const { mutateAsync: saveUserPreferences, isPending: isSavingUserPreferences } = useMutation(
		userPreferencesMutation()
	);

	// Initialize form data with default values
	const [ formData, setFormData ] = useState< DefaultLandingPreferencesFormData >( {
		defaultLandingPage,
	} );

	// Define form fields
	const fields: Field< DefaultLandingPreferencesFormData >[] = [
		{
			id: 'defaultLandingPage',
			label: __( 'Page' ),
			Edit: 'radio',
			elements: [
				{ label: __( 'Open your primary site’s dashboard.' ), value: 'primary-site-dashboard' },
				{ label: __( 'See a list of all your sites.' ), value: 'sites' },
				{ label: __( 'View posts from sites you follow.' ), value: 'reader' },
			] satisfies { label: string; value: LandingPage }[],
		},
	];

	// Check if form has been modified
	const isDirty = Boolean( defaultLandingPage !== formData.defaultLandingPage );

	// Define form layout
	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'defaultLandingPage' ],
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		const updatedAt = Date.now();
		saveUserPreferences( {
			'sites-landing-page': {
				useSitesAsLandingPage: formData.defaultLandingPage === 'sites',
				updatedAt,
			},
			'reader-landing-page': {
				useReaderAsLandingPage: formData.defaultLandingPage === 'reader',
				updatedAt,
			},
		} )
			.then( () => {
				createSuccessNotice( __( 'Default landing page saved.' ), {
					type: 'snackbar',
				} );
			} )
			.catch( () => {
				createErrorNotice( __( 'Failed to save default landing page.' ), {
					type: 'snackbar',
				} );
			} );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Default landing page' ) }
							description={ __( 'Choose what you see after logging into WordPress.com' ) }
						/>

						<DataForm< DefaultLandingPreferencesFormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< DefaultLandingPreferencesFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>

						<ButtonStack>
							<Button
								__next40pxDefaultSize
								variant="primary"
								type="submit"
								isBusy={ isSavingUserPreferences }
								disabled={ isSavingUserPreferences || ! isDirty }
							>
								{ __( 'Save' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}

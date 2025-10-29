import {
	userSettingsMutation,
	userPreferencesMutation,
	userSettingsQuery,
	rawUserPreferencesQuery,
	sitesQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	Button,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAuth } from '../../app/auth';
import { ButtonStack } from '../../components/button-stack/';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import PreferencesLoginSiteDropdown from './site-dropdown';

type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

interface LoginPreferencesFormData {
	primarySiteId?: number;
	defaultLandingPage: LandingPage;
}

export default function PreferencesLogin() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { user } = useAuth();
	const { data: primarySiteId } = useSuspenseQuery( {
		...userSettingsQuery(),
		select: ( data ) => data.primary_site_ID,
	} );
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

	const { data: sites, isLoading: isSiteListLoading } = useQuery(
		sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	const { mutateAsync: saveUserSettings, isPending: isSavingUserSettings } = useMutation(
		userSettingsMutation()
	);
	const { mutateAsync: saveUserPreferences, isPending: isSavingUserPreferences } = useMutation(
		userPreferencesMutation()
	);

	// Initialize form data with default values
	const [ formData, setFormData ] = useState< LoginPreferencesFormData >( {
		primarySiteId,
		defaultLandingPage,
	} );

	// Check if form has been modified
	const isDirty = Boolean(
		primarySiteId !== formData.primarySiteId || defaultLandingPage !== formData.defaultLandingPage
	);

	const isBusy = isSavingUserSettings || isSavingUserPreferences;

	// Define form fields
	const fields: Field< LoginPreferencesFormData >[] = [
		{
			id: 'primarySiteId',
			label: __( 'Primary site' ),
			description: __( 'Choose the default site dashboard you’ll see at login.' ),
			isVisible: () => user.visible_site_count > 0,
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				const value = getValue( { item: data } )?.toString( 10 ) ?? '';
				return (
					<VStack>
						<PreferencesLoginSiteDropdown
							sites={ sites ?? [] }
							isLoading={ isSiteListLoading }
							value={ value }
							onChange={ ( newValue ) => {
								if ( newValue ) {
									onChange( { [ id ]: parseInt( newValue, 10 ) } );
								}
							} }
							label={ hideLabelFromVision ? '' : field.label }
							hideLabelFromVision={ hideLabelFromVision }
						/>
						<Text variant="muted" as="p">
							{ field.description }
						</Text>
					</VStack>
				);
			},
		},
		{
			id: 'defaultLandingPage',
			label: __( 'Default landing page' ),
			Edit: 'radio',
			elements: [
				{ label: __( 'Primary site dashboard' ), value: 'primary-site-dashboard' },
				{ label: __( 'Sites' ), value: 'sites' },
				{ label: __( 'Reader' ), value: 'reader' },
			] satisfies { label: string; value: LandingPage }[],
		},
	];

	// Define form layout
	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'primarySiteId', 'defaultLandingPage' ],
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		const updatedAt = Date.now();
		Promise.allSettled( [
			saveUserSettings( {
				primary_site_ID: formData.primarySiteId,
			} ),
			saveUserPreferences( {
				'sites-landing-page': {
					useSitesAsLandingPage: formData.defaultLandingPage === 'sites',
					updatedAt,
				},
				'reader-landing-page': {
					useReaderAsLandingPage: formData.defaultLandingPage === 'reader',
					updatedAt,
				},
			} ),
		] ).then( ( [ userTask, prefTask ] ) => {
			if ( userTask.status === 'rejected' && prefTask.status === 'rejected' ) {
				createErrorNotice( __( 'Failed to save login preferences.' ), {
					type: 'snackbar',
				} );
			} else if ( userTask.status === 'rejected' ) {
				createErrorNotice( __( 'Failed to save primary site.' ), {
					type: 'snackbar',
				} );
			} else if ( prefTask.status === 'rejected' ) {
				createErrorNotice( __( 'Failed to save default landing page.' ), {
					type: 'snackbar',
				} );
			} else {
				createSuccessNotice( __( 'Login preferences saved.' ), {
					type: 'snackbar',
				} );
			}
		} );
	};

	return (
		<Card className="preferences-login-card">
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 3 }>
						<SectionHeader level={ 3 } title={ __( 'Login preferences' ) } />

						<DataForm< LoginPreferencesFormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< LoginPreferencesFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>

						<Text variant="muted" as="p">
							{ __( 'Select what you’ll see by default when visiting WordPress.com.' ) }
						</Text>

						<ButtonStack>
							<Button
								__next40pxDefaultSize
								variant="primary"
								type="submit"
								isBusy={ isBusy }
								disabled={ isBusy || ! isDirty }
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

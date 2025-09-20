import { userLoginPreferencesMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { SectionHeader } from '../../components/section-header';
import { useLoginPreferences } from './query';
import PreferencesLoginSiteDropdown from './site-dropdown';
import type { UserLoginPreferencesMutationProps } from '@automattic/api-queries';

type LoginPreferencesFormData = UserLoginPreferencesMutationProps;
type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

export default function PreferencesLogin() {
	// Fetch login preferences and sites using combined hook
	const {
		data: loginPreferences,
		sites = [],
		isLoading: isLoadingPreferences,
	} = useLoginPreferences();
	const mutation = useMutation( userLoginPreferencesMutation() );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// Initialize form data with default values
	const [ formData, setFormData ] = useState< LoginPreferencesFormData >( () => ( {
		primarySiteId: loginPreferences.primarySiteId,
		defaultLandingPage: loginPreferences.defaultLandingPage || 'primary-site-dashboard',
	} ) );

	// Check if form has been modified
	const isDirty = Boolean(
		loginPreferences.primarySiteId !== formData.primarySiteId ||
			loginPreferences.defaultLandingPage !== formData.defaultLandingPage
	);

	const isBusy = mutation.isPending || isLoadingPreferences;

	// Define form fields
	const fields: Field< LoginPreferencesFormData >[] = [
		{
			id: 'primarySiteId',
			label: __( 'PRIMARY SITE' ),
			description: __( 'Choose the default site dashboard you’ll see at login.' ),
			isVisible: () => sites.length > 0,
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				const value = getValue( { item: data } );
				return (
					<VStack>
						<PreferencesLoginSiteDropdown
							sites={ sites }
							value={ value }
							onChange={ ( newValue ) => {
								if ( newValue ) {
									onChange( { [ id ]: newValue } );
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
			label: __( 'DEFAULT LANDING PAGE' ),
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
		mutation.mutate(
			{
				primarySiteId: formData.primarySiteId,
				defaultLandingPage: formData.defaultLandingPage,
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Login preferences saved successfully.' ), {
						type: 'snackbar',
					} );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to save login preferences. Please try again.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
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

						<HStack>
							<Button
								__next40pxDefaultSize
								variant="primary"
								type="submit"
								isBusy={ isBusy }
								disabled={ isBusy || ! isDirty }
							>
								{ __( 'Save' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}

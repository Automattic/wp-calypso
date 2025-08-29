import { useQuery, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	__experimentalText as Text,
	CustomSelectControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, Option } from '@wordpress/dataviews';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { userPreferenceQuery, userPreferenceMutation } from '../../app/queries/me-preferences';
import { sitesQuery } from '../../app/queries/sites';
import { getSiteDisplayName } from '../../utils/site-name';
import type { LandingPage } from '../../data/me-preferences';
import type { Site } from '../../data/types';

interface LoginPreferencesFormData {
	primarySiteId?: string;
	defaultLandingPage: LandingPage;
}

type SiteOption = Option< string >;

export default function PreferencesLogin() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// Fetch current login preferences
	const { data: loginPrefs } = useSuspenseQuery( userPreferenceQuery( 'login-preferences' ) );

	// Fetch user's sites
	const { data: sites = [] } = useQuery(
		sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	// Initialize form data from server data
	const [ formData, setFormData ] = useState< LoginPreferencesFormData >( () => ( {
		primarySiteId: loginPrefs?.primarySiteId,
		defaultLandingPage: loginPrefs?.defaultLandingPage || 'primary-site-dashboard',
	} ) );

	// Update form data when server data changes
	useEffect( () => {
		setFormData( {
			primarySiteId: loginPrefs?.primarySiteId,
			defaultLandingPage: loginPrefs?.defaultLandingPage || 'primary-site-dashboard',
		} );
	}, [ loginPrefs ] );

	// Set default primary site if none selected and sites are available
	useEffect( () => {
		if ( ! formData.primarySiteId && sites.length > 0 ) {
			setFormData( ( prev ) => ( {
				...prev,
				primarySiteId: sites[ 0 ].ID.toString(),
			} ) );
		}
	}, [ formData.primarySiteId, sites ] );

	// Update preferences mutation
	const updatePreferences = useMutation( userPreferenceMutation( 'login-preferences' ) );

	// Check if form has been modified
	const isDirty = Boolean(
		loginPrefs &&
			( loginPrefs.primarySiteId !== formData.primarySiteId ||
				loginPrefs.defaultLandingPage !== formData.defaultLandingPage )
	);

	const isBusy = updatePreferences.isPending;

	// Prepare site options for DataForm
	const siteOptions: SiteOption[] = sites.map( ( site: Site ) => ( {
		value: site.ID.toString(),
		label: getSiteDisplayName( site ),
	} ) );

	// Define form fields
	const fields: Field< LoginPreferencesFormData >[] = [
		{
			id: 'primarySiteId',
			label: __( 'PRIMARY SITE' ),
			description: __( 'Choose the default site dashboard you’ll see at login.' ),
			isVisible: () => sites.length > 0,
			elements: siteOptions,
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue, elements } = field;
				const value = getValue( { item: data } );
				const typedElements = elements as SiteOption[];
				const customSelectOptions =
					typedElements?.map( ( option ) => ( {
						key: option.value,
						name: option.label,
						hint: option.label,
					} ) ) || [];
				return (
					<VStack>
						<CustomSelectControl
							label={ hideLabelFromVision ? '' : field.label }
							options={ customSelectOptions }
							value={ customSelectOptions.find( ( option ) => option.key === value ) }
							onChange={ ( { selectedItem } ) => {
								if ( selectedItem?.key ) {
									onChange( { [ id ]: selectedItem.key } );
								}
							} }
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
			],
		},
	];

	// Define form layout
	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'primarySiteId', 'defaultLandingPage' ],
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();
		try {
			await updatePreferences.mutateAsync( {
				...loginPrefs,
				primarySiteId: formData.primarySiteId,
				defaultLandingPage: formData.defaultLandingPage,
			} );

			createSuccessNotice( __( 'Login preferences saved successfully.' ), { type: 'snackbar' } );
		} catch ( error ) {
			createErrorNotice( __( 'Failed to save login preferences. Please try again.' ), {
				type: 'snackbar',
			} );
		}
	};

	return (
		<Card className="preferences-login-card">
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack>
						<Text as="h3" weight={ 500 }>
							{ __( 'Login preferences' ) }
						</Text>

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

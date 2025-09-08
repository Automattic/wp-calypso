import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	__experimentalText as Text,
	CustomSelectControl,
} from '@wordpress/components';
import { DataForm, Field, Option } from '@wordpress/dataviews';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getSiteDisplayName } from '../../utils/site-name';
import { useLoginPreferences, useUpdateLoginPreferences, type LoginPreferencesData } from './query';
import type { Site } from '@automattic/api-core';

type LoginPreferencesFormData = LoginPreferencesData;

type SiteOption = Option< string >;

export default function PreferencesLogin() {
	// Fetch login preferences using combined hook
	const { data: loginPrefs, isLoading: isLoadingPrefs } = useLoginPreferences();

	// Fetch user's sites
	const { data: sites = [] } = useQuery(
		sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	// Initialize form data with default values
	const [ formData, setFormData ] = useState< LoginPreferencesFormData >( () => ( {
		primarySiteId: undefined,
		defaultLandingPage: 'primary-site-dashboard',
	} ) );

	// Track original values for dirty detection
	const [ originalData, setOriginalData ] = useState< LoginPreferencesFormData | null >( null );

	// Update form data when server data changes
	useEffect( () => {
		if ( loginPrefs && ! originalData ) {
			const defaultSiteId =
				loginPrefs.primarySiteId || ( sites.length > 0 ? sites[ 0 ].ID.toString() : undefined );
			const data = {
				primarySiteId: defaultSiteId,
				defaultLandingPage: loginPrefs.defaultLandingPage || 'primary-site-dashboard',
			};
			setFormData( data );
			setOriginalData( data );
		}
	}, [ loginPrefs, sites, originalData ] );

	// Update preferences using combined hook
	const updatePreferences = useUpdateLoginPreferences();

	// Check if form has been modified
	const isDirty = Boolean(
		! isLoadingPrefs &&
			originalData &&
			( originalData.primarySiteId !== formData.primarySiteId ||
				originalData.defaultLandingPage !== formData.defaultLandingPage )
	);

	const isBusy = updatePreferences.isPending || isLoadingPrefs;

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
							__next40pxDefaultSize
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

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		updatePreferences.mutate( formData );
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

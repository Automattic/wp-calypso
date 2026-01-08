import { userSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { ButtonStack } from '../../components/button-stack/';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import PreferencesLoginSiteDropdown from './site-dropdown';

interface PrimarySiteFormData {
	primarySiteId?: number;
}

export default function PreferencesPrimarySite() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { user } = useAuth();
	const { queries } = useAppContext();

	const { data: primarySiteId } = useSuspenseQuery( {
		...userSettingsQuery(),
		select: ( data ) => data.primary_site_ID,
	} );

	const { data: sites, isLoading: isSiteListLoading } = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	const { mutateAsync: saveUserSettings, isPending: isSavingUserSettings } = useMutation(
		userSettingsMutation()
	);

	// Initialize form data with default values
	const [ formData, setFormData ] = useState< PrimarySiteFormData >( {
		primarySiteId,
	} );

	// Check if form has been modified
	const isDirty = primarySiteId !== formData.primarySiteId;

	// Define form fields
	const fields: Field< PrimarySiteFormData >[] = [
		{
			id: 'primarySiteId',
			label: __( 'Site' ),
			isVisible: () => user.visible_site_count > 0,
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				const value = getValue( { item: data } )?.toString( 10 ) ?? '';
				return (
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
				);
			},
		},
	];

	// Define form layout
	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'primarySiteId' ],
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		saveUserSettings( {
			primary_site_ID: formData.primarySiteId,
		} )
			.then( () => {
				createSuccessNotice( __( 'Primary site saved.' ), {
					type: 'snackbar',
				} );
			} )
			.catch( () => {
				createErrorNotice( __( 'Failed to save primary site.' ), {
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
							title={ __( 'Primary site' ) }
							description={ __(
								'Choose your default site. This determines where you land after logging in and which account appears in the Reader.'
							) }
						/>

						<NavigationBlocker shouldBlock={ isDirty } />
						<DataForm< PrimarySiteFormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< PrimarySiteFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>

						<ButtonStack>
							<Button
								__next40pxDefaultSize
								variant="primary"
								type="submit"
								isBusy={ isSavingUserSettings }
								disabled={ isSavingUserSettings || ! isDirty }
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

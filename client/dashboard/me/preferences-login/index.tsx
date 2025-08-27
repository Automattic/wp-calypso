import { useQuery, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	Button,
	RadioControl,
	CustomSelectControl,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { userPreferenceQuery, userPreferenceMutation } from '../../app/queries/me-preferences';
import { sitesQuery } from '../../app/queries/sites';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { LandingPage } from '../../data/me-preferences';
import type { Site } from '../../data/types';

interface SiteOption {
	key: string;
	name: string;
	__experimentalHint: string;
}

export default function PreferencesLogin() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// Fetch current login preferences
	const { data: loginPrefs } = useSuspenseQuery( userPreferenceQuery( 'login-preferences' ) );

	// Fetch user's sites
	const { data: sites = [] } = useQuery(
		sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	// Initialize local state from server data
	const [ primarySiteId, setPrimarySiteId ] = useState< string | undefined >(
		loginPrefs?.primarySiteId
	);
	const [ landingPage, setLandingPage ] = useState< LandingPage >(
		loginPrefs?.defaultLandingPage || 'primary-site-dashboard'
	);

	// Update local state when server data changes
	useEffect( () => {
		if ( loginPrefs?.primarySiteId ) {
			setPrimarySiteId( loginPrefs.primarySiteId );
		}
		if ( loginPrefs?.defaultLandingPage ) {
			setLandingPage( loginPrefs.defaultLandingPage );
		}
	}, [ loginPrefs ] );

	// Set default primary site if none selected and sites are available
	useEffect( () => {
		if ( ! primarySiteId && sites.length > 0 ) {
			setPrimarySiteId( sites[ 0 ].ID.toString() );
		}
	}, [ primarySiteId, sites ] );

	// Update preferences mutation
	const updatePreferences = useMutation( userPreferenceMutation( 'login-preferences' ) );

	// Prepare site options for CustomSelectControl
	const siteOptions: SiteOption[] = sites.map( ( site: Site ) => ( {
		key: site.ID.toString(),
		name: getSiteDisplayName( site ),
		__experimentalHint: getSiteDisplayUrl( site ),
	} ) );

	const handleSave = async () => {
		try {
			await updatePreferences.mutateAsync( {
				...loginPrefs,
				primarySiteId,
				defaultLandingPage: landingPage,
			} );

			createSuccessNotice( __( 'Login preferences saved successfully.' ) );
		} catch ( error ) {
			createErrorNotice( __( 'Failed to save login preferences. Please try again.' ) );
		}
	};

	return (
		<Card className="preferences-login">
			<CardBody>
				<VStack spacing={ 5 }>
					<Text as="h3" weight={ 500 }>
						{ __( 'Login preferences' ) }
					</Text>

					{ sites.length > 0 && (
						<div>
							<CustomSelectControl
								label={ __( 'PRIMARY SITE' ) }
								options={ siteOptions }
								value={ siteOptions.find( ( option ) => option.key === primarySiteId ) }
								onChange={ ( { selectedItem } ) => {
									if ( selectedItem?.key ) {
										setPrimarySiteId( selectedItem.key );
									}
								} }
							/>
							<Text variant="muted" style={ { fontSize: '13px', marginTop: '4px' } }>
								{ __( "Choose the default site dashboard you'll see at login." ) }
							</Text>
						</div>
					) }

					<div>
						<RadioControl
							label={ __( 'DEFAULT LANDING PAGE' ) }
							selected={ landingPage }
							options={
								[
									{ label: __( 'Primary site dashboard' ), value: 'primary-site-dashboard' },
									{ label: __( 'Sites' ), value: 'sites' },
									{ label: __( 'Reader' ), value: 'reader' },
								] satisfies { label: string; value: LandingPage }[]
							}
							onChange={ ( value: string ) => {
								setLandingPage( value as LandingPage );
							} }
						/>
						<Text variant="muted" style={ { fontSize: '13px', marginTop: '4px' } }>
							{ __( "Select what you'll see by default when visiting WordPress.com." ) }
						</Text>
					</div>

					<Button
						variant="primary"
						onClick={ handleSave }
						isBusy={ updatePreferences.isPending }
						disabled={ updatePreferences.isPending }
					>
						{ __( 'Save' ) }
					</Button>
				</VStack>
			</CardBody>
		</Card>
	);
}

import {
	rawUserPreferencesQuery,
	userPreferencesMutation,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { ButtonStack } from '../../components/button-stack/';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import PreferencesLoginSiteDropdown from '../preferences-primary-site/site-dropdown';

type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

interface DefaultLandingFormData {
	defaultLandingPage: LandingPage;
}

interface PrimarySiteFormData {
	primarySiteId?: number;
}

function LandingPageCard() {
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

	const { mutateAsync: saveUserPreferences, isPending } = useMutation( userPreferencesMutation() );

	const [ formData, setFormData ] = useState< DefaultLandingFormData >( {
		defaultLandingPage,
	} );

	const isDirty = defaultLandingPage !== formData.defaultLandingPage;

	const fields: Field< DefaultLandingFormData >[] = [
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
							title={ __( 'Landing page' ) }
							description={ __( 'Choose your destination after you log in.' ) }
						/>
						<NavigationBlocker shouldBlock={ isDirty } />
						<DataForm< DefaultLandingFormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< DefaultLandingFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<ButtonStack>
							<Button
								__next40pxDefaultSize
								variant="primary"
								type="submit"
								isBusy={ isPending }
								disabled={ isPending || ! isDirty }
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

function PrimarySiteCard() {
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

	const { mutateAsync: saveUserSettings, isPending } = useMutation( userSettingsMutation() );

	const [ formData, setFormData ] = useState< PrimarySiteFormData >( {
		primarySiteId,
	} );

	const isDirty = primarySiteId !== formData.primarySiteId;

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
							description={ __( 'Your go-to site, always within reach.' ) }
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
								isBusy={ isPending }
								disabled={ isPending || ! isDirty }
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

export default function WordPressDefaults() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Account defaults' ) }
					description={ __( 'Set your starting point after you log in and primary site.' ) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<LandingPageCard />
				<PrimarySiteCard />
			</VStack>
		</PageLayout>
	);
}

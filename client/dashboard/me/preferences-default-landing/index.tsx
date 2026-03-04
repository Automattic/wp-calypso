import {
	userPreferencesMutation,
	userSettingsMutation,
	userSettingsQuery,
	rawUserPreferencesQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import PreferencesPrimarySite from '../preferences-primary-site';

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

	const { data: savedPrimarySiteId } = useSuspenseQuery( {
		...userSettingsQuery(),
		select: ( data ) => data.primary_site_ID,
	} );

	const { mutateAsync: saveUserPreferences, isPending: isSavingPreferences } = useMutation(
		userPreferencesMutation()
	);

	const { mutateAsync: saveUserSettings, isPending: isSavingSettings } = useMutation(
		userSettingsMutation()
	);

	const [ formData, setFormData ] = useState< DefaultLandingPreferencesFormData >( {
		defaultLandingPage,
	} );
	const [ primarySiteId, setPrimarySiteId ] = useState< number | undefined >( savedPrimarySiteId );

	const isLandingPageDirty = defaultLandingPage !== formData.defaultLandingPage;
	const isPrimarySiteDirty = primarySiteId !== savedPrimarySiteId;
	const isDirty = isLandingPageDirty || isPrimarySiteDirty;

	const fields: Field< DefaultLandingPreferencesFormData >[] = [
		{
			id: 'defaultLandingPage',
			label: __( 'Page' ),
			Edit: 'radio',
			elements: [
				{ label: __( "Open your primary site's dashboard." ), value: 'primary-site-dashboard' },
				{ label: __( 'See a list of all your sites.' ), value: 'sites' },
				{ label: __( 'View posts from sites you follow.' ), value: 'reader' },
			] satisfies { label: string; value: LandingPage }[],
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'defaultLandingPage' ],
	};

	const handleSaveLandingPage = async () => {
		try {
			const updatedAt = Date.now();
			await saveUserPreferences( {
				'sites-landing-page': {
					useSitesAsLandingPage: formData.defaultLandingPage === 'sites',
					updatedAt,
				},
				'reader-landing-page': {
					useReaderAsLandingPage: formData.defaultLandingPage === 'reader',
					updatedAt,
				},
			} );
			createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
		} catch {
			createErrorNotice( __( 'Failed to save settings.' ), { type: 'snackbar' } );
		}
	};

	const handleSavePrimarySite = async () => {
		try {
			await saveUserSettings( {
				primary_site_ID: primarySiteId,
			} );
			createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
		} catch {
			createErrorNotice( __( 'Failed to save settings.' ), { type: 'snackbar' } );
		}
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'WordPress.com defaults' ) }
					description={ __( 'Set your starting point after you log in and primary site.' ) }
				/>
			}
		>
			<NavigationBlocker shouldBlock={ isDirty } />
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Landing page' ) }
							description={ __( 'Choose your destination after you log in.' ) }
						/>
						<DataForm< DefaultLandingPreferencesFormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< DefaultLandingPreferencesFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<HStack justify="flex-start">
							<Button
								__next40pxDefaultSize
								variant="primary"
								isBusy={ isSavingPreferences }
								disabled={ isSavingPreferences || ! isLandingPageDirty }
								onClick={ handleSaveLandingPage }
							>
								{ __( 'Save' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
			<PreferencesPrimarySite
				primarySiteId={ primarySiteId }
				onChange={ setPrimarySiteId }
				footer={
					<HStack justify="flex-start">
						<Button
							__next40pxDefaultSize
							variant="primary"
							isBusy={ isSavingSettings }
							disabled={ isSavingSettings || ! isPrimarySiteDirty }
							onClick={ handleSavePrimarySite }
						>
							{ __( 'Save' ) }
						</Button>
					</HStack>
				}
			/>
		</PageLayout>
	);
}

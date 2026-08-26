import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button, ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ActionList } from '../../components/action-list';
import { Card, CardBody } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import SiteIcon from '../../components/site-icon';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import PreferencesLoginSiteDropdown from '../preferences-defaults/site-dropdown';
import type { Site } from '@automattic/api-core';

export default function WordPressLabs() {
	const { createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();

	const { data: optIn } = useSuspenseQuery( userPreferenceQuery( 'wordpress-labs-opt-in' ) );
	const { data: excludedSiteIds } = useSuspenseQuery(
		userPreferenceQuery( 'wordpress-labs-excluded-sites' )
	);

	const { mutate: saveOptInPreference, isPending: isSavingOptIn } = useMutation(
		userPreferenceMutation( 'wordpress-labs-opt-in' )
	);
	const { mutate: saveExcludedSites, isPending: isSavingExceptions } = useMutation(
		withSnackbar( userPreferenceMutation( 'wordpress-labs-excluded-sites' ), {
			error: __( 'Failed to update site exceptions.' ),
		} )
	);

	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const adminSites = ( ( sitesQueryResult.data as Site[] | undefined ) ?? [] ).filter(
		( site ) => site.capabilities?.manage_options
	);
	const isSiteListLoading = sitesQueryResult.isLoading;

	const [ selectedSiteId, setSelectedSiteId ] = useState< string | null >( null );

	const isEnabled = optIn.value === 'opt-in';
	const hasOptedOutBefore = optIn.value === 'opt-out' && optIn.updated_at !== '';

	const excludedSites = excludedSiteIds
		.map( ( siteId ) => adminSites.find( ( site ) => site.ID === siteId ) )
		.filter( ( site ): site is Site => Boolean( site ) );

	const availableSitesForPicker = adminSites.filter(
		( site ) => ! excludedSiteIds.includes( site.ID )
	);

	const handleToggle = ( enabled: boolean ) => {
		recordTracksEvent( 'calypso_dashboard_me_preferences_wordpress_labs_toggle_click', {
			enabled,
		} );

		saveOptInPreference(
			{
				value: enabled ? 'opt-in' : 'opt-out',
				updated_at: new Date().toISOString(),
			},
			{
				onError() {
					createErrorNotice(
						enabled
							? __( 'Failed to enable WordPress Labs.' )
							: __( 'Failed to disable WordPress Labs.' ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	const handleSiteExclude = ( siteId: number ) => {
		saveExcludedSites( [ ...excludedSiteIds, siteId ], {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_me_preferences_wordpress_labs_site_excluded', {
					site_id: siteId,
				} );
			},
		} );
	};

	const handleSiteRestore = ( siteId: number ) => {
		saveExcludedSites(
			excludedSiteIds.filter( ( id ) => id !== siteId ),
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_me_preferences_wordpress_labs_site_restored', {
						site_id: siteId,
					} );
				},
			}
		);
	};

	const handleSitePickerSelect = ( siteIdStr: string | null | undefined ) => {
		if ( siteIdStr ) {
			handleSiteExclude( parseInt( siteIdStr, 10 ) );
			setSelectedSiteId( null );
		}
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'WordPress Labs' ) }
					description={ __(
						'Be the first to try the new features we’re building and help shape the future of WordPress.com.'
					) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_me_preferences_wordpress_labs_view" />
			<VStack spacing={ 8 }>
				<VStack spacing={ 4 }>
					<Card>
						<CardBody>
							<VStack spacing={ 4 } alignment="flex-start">
								<SectionHeader title={ __( 'WordPress Labs' ) } level={ 3 } />
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ isEnabled }
									label={ __( 'Enable WordPress Labs' ) }
									disabled={ isSavingOptIn }
									onChange={ handleToggle }
								/>
							</VStack>
						</CardBody>
					</Card>
					{ isEnabled && (
						<Notice variant="success" title={ __( 'You’re in!' ) }>
							{ __(
								'Every site for which you are an Administrator has been opted into WordPress Labs. You can find the list of current experiments below.'
							) }
						</Notice>
					) }
					{ ! isEnabled && hasOptedOutBefore && (
						<Notice variant="info">
							{ __(
								'You’ve opted out of WordPress Labs. No experimental features will be added to your site.'
							) }
						</Notice>
					) }
				</VStack>

				{ isEnabled && (
					<VStack spacing={ 2 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Current experiments' ) }
							description={ __( 'Beta features and tools you can try will show up here.' ) }
						/>
						<Card>
							<CardBody>{ __( 'No experiments are available yet. Check back soon.' ) }</CardBody>
						</Card>
					</VStack>
				) }

				{ isEnabled && (
					<VStack spacing={ 4 }>
						<Card>
							<CardBody>
								<VStack spacing={ 4 }>
									<SectionHeader
										level={ 3 }
										title={ __( 'Add a site exception' ) }
										description={ __(
											'WordPress Labs is enabled for every site where you’re an Administrator. Remove specific sites here.'
										) }
									/>
									<PreferencesLoginSiteDropdown
										sites={ availableSitesForPicker }
										isLoading={ isSiteListLoading || isSavingExceptions }
										value={ selectedSiteId ?? '' }
										onChange={ handleSitePickerSelect }
										hideLabelFromVision
									/>
								</VStack>
							</CardBody>
						</Card>

						{ excludedSites.length > 0 && (
							<VStack spacing={ 2 }>
								<SectionHeader
									level={ 3 }
									title={ __( 'Excluded sites' ) }
									description={ __( 'WordPress Labs is disabled for these sites.' ) }
								/>
								<ActionList>
									{ excludedSites.map( ( site ) => (
										<ActionList.ActionItem
											key={ site.ID }
											title={ getSiteDisplayName( site ) }
											description={ getSiteDisplayUrl( site ) || undefined }
											decoration={ <SiteIcon site={ site } size={ 40 } /> }
											actions={
												<Button
													variant="secondary"
													size="compact"
													disabled={ isSavingExceptions }
													onClick={ () => handleSiteRestore( site.ID ) }
												>
													{ __( 'Restore' ) }
												</Button>
											}
										/>
									) ) }
								</ActionList>
							</VStack>
						) }
					</VStack>
				) }
			</VStack>
		</PageLayout>
	);
}

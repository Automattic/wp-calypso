import { HostingFeatures, updateBigSkyPlugin } from '@automattic/api-core';
import {
	bigSkyPluginQuery,
	invalidatePlugins,
	queryClient,
	siteQueryFilter,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { comment } from '@wordpress/icons';
import { useState, useMemo, useEffect } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
import { ActionList } from '../../../components/action-list';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import SiteIcon from '../../../components/site-icon';
import UpsellCallout from '../../../sites/hosting-feature-gated-with-callout/upsell';
import { getSiteDisplayName } from '../../../utils/site-name';
import { getSiteDisplayUrl } from '../../../utils/site-url';
import PreferencesLoginSiteDropdown from '../../preferences-primary-site/site-dropdown';
import type { Site } from '@automattic/api-core';

export default function McpAiSites() {
	const { queries } = useAppContext();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = useMemo(
		() => ( sitesQueryResult.data as Site[] | undefined ) ?? [],
		[ sitesQueryResult.data ]
	);
	const isSiteListLoading = sitesQueryResult.isLoading;

	const [ selectedSiteId, setSelectedSiteId ] = useState< string | null >( null );
	const [ pendingSiteId, setPendingSiteId ] = useState< number | null >( null );
	const [ upsellSite, setUpsellSite ] = useState< Site | null >( null );

	const aiEnabledSiteIds = useMemo( () => {
		return new Set< number >( sites.filter( ( s ) => s.big_sky_enabled ).map( ( s ) => s.ID ) );
	}, [ sites ] );

	const enabledSites = useMemo(
		() =>
			sites
				.filter( ( site: Site ) => aiEnabledSiteIds.has( site.ID ) )
				.map( ( site: Site ) => ( {
					id: site.ID,
					name: getSiteDisplayName( site ),
					displayUrl: getSiteDisplayUrl( site ),
					site,
				} ) ),
		[ sites, aiEnabledSiteIds ]
	);

	const availableSitesForPicker = useMemo(
		() => sites.filter( ( site: Site ) => ! aiEnabledSiteIds.has( site.ID ) ),
		[ sites, aiEnabledSiteIds ]
	);

	const { mutate: toggleAiForSite, isPending } = useMutation( {
		mutationFn: ( { siteId, enable }: { siteId: number; enable: boolean } ) =>
			updateBigSkyPlugin( siteId, { enable } ),
		onSuccess: ( _, { siteId } ) => {
			queryClient.invalidateQueries( { queryKey: bigSkyPluginQuery( siteId ).queryKey } );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
			invalidatePlugins();
		},
		meta: {
			snackbar: {
				success: __( 'AI assistant settings saved.' ),
				error: __( 'Failed to save AI assistant settings.' ),
			},
		},
	} );

	const { data: pendingPluginStatus, isFetching: isCheckingPlan } = useQuery( {
		...bigSkyPluginQuery( pendingSiteId! ),
		enabled: pendingSiteId !== null,
	} );

	useEffect( () => {
		if ( ! pendingSiteId || ! pendingPluginStatus ) {
			return;
		}
		if ( pendingPluginStatus.available ) {
			toggleAiForSite( { siteId: pendingSiteId, enable: true } );
		} else {
			const site = sites.find( ( s ) => s.ID === pendingSiteId ) ?? null;
			setUpsellSite( site );
		}
		setPendingSiteId( null );
	}, [ pendingPluginStatus, pendingSiteId, sites, toggleAiForSite ] );

	const handleSitePickerSelect = ( siteIdStr: string | null | undefined ) => {
		if ( siteIdStr ) {
			setPendingSiteId( parseInt( siteIdStr, 10 ) );
			setSelectedSiteId( null );
		}
	};

	const isAiEnabled = userSettings?.ai_assistant ?? false;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Add AI assistant to sites' ) }
					description={
						isAiEnabled
							? __( 'The WordPress.com AI assistant is enabled. Add site exceptions here.' )
							: __( 'The WordPress.com AI assistant is disabled. Add it to individual sites here.' )
					}
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_ai_sites_view" />
			<VStack spacing={ 4 }>
				{ upsellSite ? (
					<>
						<UpsellCallout
							site={ upsellSite }
							feature={ HostingFeatures.BIG_SKY }
							upsellId="ai-tools"
							upsellTitle={ __( 'Your dream site is just a prompt away' ) }
							upsellDescription={ __(
								'Get AI-powered assistance to help you build, edit, and redesign your site with ease.'
							) }
							upsellIcon={ comment }
						/>
						<Button
							variant="tertiary"
							size="compact"
							style={ { alignSelf: 'flex-start' } }
							onClick={ () => setUpsellSite( null ) }
						>
							{ __( '← Back' ) }
						</Button>
					</>
				) : (
					<>
						<Card>
							<CardBody>
								<VStack spacing={ 4 }>
									<SectionHeader
										level={ 3 }
										title={ __( 'Add a site' ) }
										description={ __( 'Search for a site to enable the AI assistant.' ) }
									/>
									<PreferencesLoginSiteDropdown
										sites={ availableSitesForPicker }
										isLoading={ isSiteListLoading || isCheckingPlan }
										value={ selectedSiteId ?? '' }
										onChange={ handleSitePickerSelect }
										hideLabelFromVision
									/>
								</VStack>
							</CardBody>
						</Card>

						{ enabledSites.length > 0 && (
							<VStack spacing={ 2 }>
								<SectionHeader
									level={ 3 }
									title={ __( 'Enabled sites' ) }
									description={ __( 'These sites have the AI assistant enabled.' ) }
								/>
								<ActionList>
									{ enabledSites.map( ( site ) => (
										<ActionList.ActionItem
											key={ site.id }
											title={ site.name }
											description={ site.displayUrl || undefined }
											decoration={
												site.site ? <SiteIcon site={ site.site } size={ 32 } /> : undefined
											}
											actions={
												<Button
													variant="secondary"
													size="compact"
													disabled={ isPending }
													onClick={ () => toggleAiForSite( { siteId: site.id, enable: false } ) }
												>
													{ __( 'Remove' ) }
												</Button>
											}
										/>
									) ) }
								</ActionList>
							</VStack>
						) }
					</>
				) }
			</VStack>
		</PageLayout>
	);
}

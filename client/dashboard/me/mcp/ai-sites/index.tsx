import { DotcomFeatures, updateBigSkyPlugin } from '@automattic/api-core';
import { userSettingsQuery, pluginsQuery, invalidatePlugins } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
import { ActionList } from '../../../components/action-list';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import SiteIcon from '../../../components/site-icon';
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
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const isSiteListLoading = sitesQueryResult.isLoading;

	const [ selectedSiteId, setSelectedSiteId ] = useState< string | null >( null );

	const { data: pluginsData } = useQuery( pluginsQuery() );
	const aiEnabledSiteIds = new Set(
		Object.entries( pluginsData?.sites ?? {} )
			.filter( ( [ , plugins ] ) =>
				plugins.some( ( p ) => p.slug === DotcomFeatures.BIG_SKY && p.active )
			)
			.map( ( [ siteId ] ) => Number( siteId ) )
	);

	const enabledSites = sites
		.filter( ( site: Site ) => aiEnabledSiteIds.has( site.ID ) )
		.map( ( site: Site ) => ( {
			id: site.ID,
			name: getSiteDisplayName( site ),
			displayUrl: getSiteDisplayUrl( site ),
			site,
		} ) );

	const availableSitesForPicker = sites.filter(
		( site: Site ) => ! aiEnabledSiteIds.has( site.ID )
	);

	const { mutate: toggleAiForSite, isPending } = useMutation( {
		mutationFn: ( { siteId, enable }: { siteId: number; enable: boolean } ) =>
			updateBigSkyPlugin( siteId, { enable } ),
		onSuccess: () => {
			invalidatePlugins();
		},
		meta: {
			snackbar: {
				success: __( 'AI assistant settings saved.' ),
				error: __( 'Failed to save AI assistant settings.' ),
			},
		},
	} );

	const handleSitePickerSelect = ( siteIdStr: string | null | undefined ) => {
		if ( siteIdStr ) {
			toggleAiForSite( { siteId: parseInt( siteIdStr, 10 ), enable: true } );
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
								isLoading={ isSiteListLoading }
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
									decoration={ site.site ? <SiteIcon site={ site.site } size={ 32 } /> : undefined }
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
			</VStack>
		</PageLayout>
	);
}

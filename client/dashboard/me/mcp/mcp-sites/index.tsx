import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getEnabledSiteIds,
} from '../../../../me/mcp/utils';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
import { siteSettingsAIToolsRoute } from '../../../app/router/sites';
import { ActionList } from '../../../components/action-list';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import SiteIcon from '../../../components/site-icon';
import { getSiteDisplayName } from '../../../utils/site-name';
import { getSiteDisplayUrl } from '../../../utils/site-url';
import PreferencesLoginSiteDropdown from '../../preferences-primary-site/site-dropdown';
import type { Site } from '@automattic/api-core';

export default function McpMcpSites() {
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const isSiteListLoading = sitesQueryResult.isLoading;

	const [ selectedSiteId, setSelectedSiteId ] = useState< string | null >( null );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const mcpEnabled = Object.values( mcpAbilities ).some( ( tool: any ) => tool.enabled );

	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const enabledSiteIds = getEnabledSiteIds( userSettings || {} );

	const managedSiteIds = mcpEnabled ? disabledSiteIds : enabledSiteIds;

	const buildSiteEntry = ( siteId: number ) => {
		const site = sites.find( ( s: Site ) => s.ID === siteId );
		return {
			id: siteId,
			name: site ? getSiteDisplayName( site ) : String( siteId ),
			displayUrl: site ? getSiteDisplayUrl( site ) : '',
			slug: site?.slug ?? null,
			site: site ?? null,
		};
	};

	const managedSites = managedSiteIds.map( buildSiteEntry );

	const availableSitesForPicker = sites.filter(
		( site: Site ) => ! managedSiteIds.includes( site.ID )
	);

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const handleSiteAdd = ( siteId: number ) => {
		const eventName = mcpEnabled
			? 'calypso_dashboard_mcp_site_exception_added'
			: 'calypso_dashboard_mcp_site_added';
		mutation.mutate(
			{
				mcp_abilities: {
					sites: [
						{
							blog_id: siteId,
							site_level_enabled: mcpEnabled ? false : true,
						},
					],
				},
			} as any,
			{
				onSuccess: () => {
					recordTracksEvent( eventName, { site_id: siteId } );
				},
			}
		);
	};

	const handleSiteRemove = ( siteId: number ) => {
		mutation.mutate(
			{
				mcp_abilities: {
					sites: [ { blog_id: siteId, site_level_enabled: null } ],
				},
			} as any,
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_site_removed', { site_id: siteId } );
				},
			}
		);
	};

	const handleSitePickerSelect = ( siteIdStr: string | null | undefined ) => {
		if ( siteIdStr ) {
			const siteId = parseInt( siteIdStr, 10 );
			handleSiteAdd( siteId );
			setSelectedSiteId( null );
		}
	};

	const pageTitle = mcpEnabled ? __( 'Site exceptions' ) : __( 'Add MCP to specific sites' );
	const pageDescription = mcpEnabled
		? __( 'MCP access is enabled at the account level. Disable it for specific sites here.' )
		: __( 'MCP access is disabled at the account level. Add it to individual sites here.' );

	const addCardTitle = mcpEnabled ? __( 'Add a site exception' ) : __( 'Add a site' );
	const addCardDescription = mcpEnabled
		? __( 'Search for a site to disable MCP access.' )
		: __( 'Search for a site to enable MCP access.' );

	const managedSitesTitle = mcpEnabled
		? __( 'Sites with disabled MCP access' )
		: __( 'Enabled sites' );
	const managedSitesDescription = mcpEnabled
		? __( 'MCP access is disabled for these sites.' )
		: __( 'These sites have MCP access enabled.' );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ pageTitle }
					description={ pageDescription }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_mcp_sites_view" />
			<VStack spacing={ 8 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ addCardTitle }
								description={ addCardDescription }
							/>
							<PreferencesLoginSiteDropdown
								sites={ availableSitesForPicker }
								isLoading={ isSiteListLoading || mutation.isPending }
								value={ selectedSiteId ?? '' }
								onChange={ handleSitePickerSelect }
								hideLabelFromVision
							/>
						</VStack>
					</CardBody>
				</Card>

				{ managedSites.length > 0 && (
					<VStack spacing={ 2 }>
						<SectionHeader
							level={ 3 }
							title={ managedSitesTitle }
							description={ managedSitesDescription }
						/>
						<ActionList>
							{ managedSites.map( ( site ) => (
								<ActionList.ActionItem
									key={ site.id }
									title={ site.name }
									description={ site.displayUrl || undefined }
									decoration={ site.site ? <SiteIcon site={ site.site } size={ 40 } /> : undefined }
									actions={
										<>
											{ site.slug && (
												<RouterLinkButton
													variant="tertiary"
													size="compact"
													to={ siteSettingsAIToolsRoute.fullPath }
													params={ { siteSlug: site.slug } }
												>
													{ __( 'Manage' ) }
												</RouterLinkButton>
											) }
											<Button
												variant="secondary"
												size="compact"
												disabled={ mutation.isPending }
												onClick={ () => handleSiteRemove( site.id ) }
											>
												{ __( 'Remove' ) }
											</Button>
										</>
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

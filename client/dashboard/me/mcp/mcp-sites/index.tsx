import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getEnabledSiteIds,
} from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
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

export default function McpMcpSites() {
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

	const handleSiteToggle = ( siteId: number, enabled: boolean ) => {
		mutation.mutate( {
			mcp_abilities: {
				sites: [
					{
						blog_id: siteId,
						account_tools_enabled: enabled,
					},
				],
			},
		} as any );
	};

	const handleSitePickerSelect = ( siteIdStr: string | null | undefined ) => {
		if ( siteIdStr ) {
			const siteId = parseInt( siteIdStr, 10 );
			// When account MCP is ON: disable for specific site (add exception)
			// When account MCP is OFF: enable for specific site
			handleSiteToggle( siteId, ! mcpEnabled );
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
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ pageTitle }
					description={ pageDescription }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_mcp_sites_view" />
			<VStack spacing={ 4 }>
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
								isLoading={ isSiteListLoading }
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
						<Card>
							<CardBody>
								<VStack spacing={ 3 }>
									{ managedSites.map( ( site ) => (
										<HStack key={ site.id } justify="space-between" alignment="center">
											<HStack spacing={ 3 } alignment="center" justify="flex-start">
												{ site.site && <SiteIcon site={ site.site } size={ 32 } /> }
												<VStack spacing={ 0 }>
													<Text weight={ 500 } size={ 14 }>
														{ site.name }
													</Text>
													<Text variant="muted" size={ 12 }>
														{ site.displayUrl }
													</Text>
												</VStack>
											</HStack>
											<Button
												variant="secondary"
												size="compact"
												disabled={ mutation.isPending }
												onClick={ () => handleSiteToggle( site.id, mcpEnabled ) }
											>
												{ __( 'Remove' ) }
											</Button>
										</HStack>
									) ) }
								</VStack>
							</CardBody>
						</Card>
					</VStack>
				) }
			</VStack>
		</PageLayout>
	);
}

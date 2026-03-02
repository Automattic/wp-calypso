import { updateBigSkyPlugin, updateUserSettings } from '@automattic/api-core';
import {
	bigSkyPluginQuery,
	queryClient,
	siteQueryFilter,
	userSettingsQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQueries, useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	ToggleControl,
	Icon,
	Spinner,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { connection, notAllowed, seen, pencil } from '@wordpress/icons';
import { useRef } from 'react';
import { getAccountMcpAbilities, getDisabledSiteIds } from '../../../me/mcp/utils';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { Card, CardBody, CardHeader } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { SectionHeader } from '../../components/section-header';
import '../../components/summary-button-list/style.scss';
import { getPermissionLevel } from './categories';
import type { Site } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

// Big Sky star icon — uses paths from BigSkyLogo.CentralLogo (heartless variant)
// without explicit fill attributes so CSS hover color changes work via `currentColor`.
const bigSkyIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="m19.223 11.55-3.095-1.068a4.21 4.21 0 0 1-2.61-2.61L12.45 4.777c-.145-.426-.755-.426-.9 0l-1.068 3.095a4.21 4.21 0 0 1-2.61 2.61L4.777 11.55c-.426.145-.426.755 0 .9l3.095 1.068a4.21 4.21 0 0 1 2.61 2.61l1.068 3.095c.145.426.755.426.9 0l1.068-3.095a4.21 4.21 0 0 1 2.61-2.61l3.095-1.068c.426-.145.426-.755 0-.9Zm-3.613.68-1.547.533a2.105 2.105 0 0 0-1.306 1.305l-.533 1.548a.24.24 0 0 1-.453 0l-.534-1.548a2.105 2.105 0 0 0-1.305-1.305l-1.548-.534a.24.24 0 0 1 0-.453l1.548-.534a2.105 2.105 0 0 0 1.305-1.305l.534-1.547a.24.24 0 0 1 .453 0l.534 1.547c.21.615.695 1.095 1.305 1.305l1.547.534a.24.24 0 0 1 0 .453Z" />
	</svg>
);

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	annotations?: Record< string, unknown >;
}

function McpComponent() {
	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	// Fetch BigSky plugin status for all sites (AI assistant card)
	const bigSkyQueries = useQueries( {
		queries: sites.map( ( site ) => ( {
			...bigSkyPluginQuery( site.ID ),
			enabled: sites.length > 0,
		} ) ),
	} );

	// Compute AI assistant stats across all sites
	const bigSkyAvailableSiteIds: number[] = [];
	let bigSkyEnabledCount = 0;
	let bigSkyDisabledCount = 0;
	sites.forEach( ( site, index ) => {
		const result = bigSkyQueries[ index ];
		if ( result?.data && result.data.available ) {
			bigSkyAvailableSiteIds.push( site.ID );
			if ( result.data.enabled ) {
				bigSkyEnabledCount++;
			} else {
				bigSkyDisabledCount++;
			}
		}
	} );
	const bigSkyGlobalEnabled = bigSkyEnabledCount > 0 && bigSkyEnabledCount >= bigSkyDisabledCount;

	// Only show loading state when we have zero BigSky data — truly cold cache.
	const bigSkyHasAnyData = bigSkyQueries.some( ( q ) => q.data !== undefined );
	const bigSkyIsFetching = bigSkyQueries.some( ( q ) => q.isFetching );
	const bigSkyIsInitialLoading = ! bigSkyHasAnyData && bigSkyIsFetching;

	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );

	// Bulk MCP toggle: sends tool updates in sequential chunks with a short
	// delay between them. The API does a read-modify-write internally, so
	// concurrent writes to the same user settings record cause conflicts.
	// Sequential chunks with delays ensure each write propagates before the
	// next one reads.
	const TOOLS_CHUNK_SIZE = 20;
	const toggleAllRef = useRef( false );
	const mutation = useMutation( {
		mutationFn: async ( payload: {
			account: Record< string, boolean >;
			sites?: Array< { blog_id: number; account_tools_enabled: boolean } >;
		} ) => {
			const { account, sites } = payload;
			const entries = Object.entries( account );

			for ( let i = 0; i < entries.length; i += TOOLS_CHUNK_SIZE ) {
				const chunk = Object.fromEntries( entries.slice( i, i + TOOLS_CHUNK_SIZE ) );
				const chunkPayload: any = { mcp_abilities: { account: chunk } };
				// Include sites payload in the last chunk
				if ( i + TOOLS_CHUNK_SIZE >= entries.length && sites?.length ) {
					chunkPayload.mcp_abilities.sites = sites;
				}
				await updateUserSettings( chunkPayload );
				// Short delay between chunks for server propagation
				if ( i + TOOLS_CHUNK_SIZE < entries.length ) {
					await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );
				}
			}
		},
		onSuccess: ( _data, payload ) => {
			// Batch-update the cache based on intent so the UI updates in one render.
			queryClient.setQueryData( userSettingsQuery().queryKey, ( oldData: any ) => {
				if ( ! oldData?.mcp_abilities?.account ) {
					return oldData;
				}
				const newAccount = { ...oldData.mcp_abilities.account };
				for ( const [ key, enabled ] of Object.entries( payload.account ) ) {
					if ( key in newAccount ) {
						newAccount[ key ] = { ...newAccount[ key ], enabled };
					}
				}
				return {
					...oldData,
					mcp_abilities: {
						...oldData.mcp_abilities,
						account: newAccount,
					},
				};
			} );
			// Invalidate for background server sync.
			queryClient.invalidateQueries( { queryKey: userSettingsQuery().queryKey } );
		},
		onSettled: () => {
			toggleAllRef.current = false;
		},
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	// Bulk toggle AI assistant for all eligible sites
	const bigSkyBulkMutation = useMutation( {
		mutationFn: async ( { enable }: { enable: boolean } ) => {
			await Promise.all(
				bigSkyAvailableSiteIds.map( ( siteId ) => updateBigSkyPlugin( siteId, { enable } ) )
			);
		},
		onSuccess: ( _data, { enable } ) => {
			// Batch-update all caches at once so counts change in a single render.
			bigSkyAvailableSiteIds.forEach( ( siteId ) => {
				queryClient.setQueryData(
					bigSkyPluginQuery( siteId ).queryKey,
					( old: Record< string, unknown > | undefined ) =>
						old ? { ...old, enabled: enable } : old
				);
			} );
			// Invalidate for background server sync.
			bigSkyAvailableSiteIds.forEach( ( siteId ) => {
				queryClient.invalidateQueries( {
					queryKey: bigSkyPluginQuery( siteId ).queryKey,
				} );
				queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			} );
		},
		meta: {
			snackbar: {
				success: __( 'AI assistant settings saved.' ),
				error: __( 'Failed to save AI assistant settings.' ),
			},
		},
	} );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = Object.entries( mcpAbilities );
	const hasTools = availableTools.length > 0;
	const enabledToolsCount = Object.values( mcpAbilities ).filter( ( tool ) => tool.enabled ).length;
	const anyToolsEnabled = enabledToolsCount > 0;

	const handleToggleAll = ( enabled: boolean ) => {
		if ( toggleAllRef.current ) {
			return;
		}
		toggleAllRef.current = true;

		// Only send tools that need to change state — reduces payload and
		// number of API calls needed.
		const accountAbilities: Record< string, boolean > = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			const tool = mcpAbilities[ toolId ];
			if ( enabled ) {
				// When enabling: read tools ON, write/manage OFF.
				const level = getPermissionLevel( tool );
				const shouldEnable = level === 'read';
				if ( tool.enabled !== shouldEnable ) {
					accountAbilities[ toolId ] = shouldEnable;
				}
			} else if ( tool.enabled ) {
				// When disabling: only disable currently-enabled tools.
				accountAbilities[ toolId ] = false;
			}
		} );

		if ( Object.keys( accountAbilities ).length === 0 ) {
			toggleAllRef.current = false;
			return;
		}

		mutation.mutate( {
			account: accountAbilities,
			sites:
				disabledSiteIds.length > 0
					? disabledSiteIds.map( ( siteId: number ) => ( {
							blog_id: siteId,
							account_tools_enabled: true,
					  } ) )
					: undefined,
		} );
	};

	// Shared helper: compute badge text for a set of tools.
	const getBadgeText = ( enabledCount: number, totalCount: number ): string => {
		if ( enabledCount === totalCount ) {
			return __( 'All enabled' );
		}
		if ( enabledCount === 0 ) {
			return __( 'Disabled' );
		}
		return sprintf(
			/* translators: %1$d is enabled count, %2$d is total */
			__( '%1$d of %2$d enabled' ),
			enabledCount,
			totalCount
		);
	};

	// Shared helper: compute badge intent for a set of tools.
	const getBadgeIntent = (
		enabledCount: number,
		totalCount: number
	): 'success' | 'info' | 'default' => {
		if ( enabledCount === totalCount ) {
			return 'success';
		}
		if ( enabledCount > 0 ) {
			return 'info';
		}
		return 'default';
	};

	// Group tools by permission level, merging Write + Manage
	const permissionGroups: Record< string, Array< [ string, McpAbility ] > > = {};
	availableTools.forEach( ( [ toolId, tool ] ) => {
		const level = getPermissionLevel( tool );
		if ( ! permissionGroups[ level ] ) {
			permissionGroups[ level ] = [];
		}
		permissionGroups[ level ].push( [ toolId, tool ] );
	} );

	const readTools = permissionGroups.read || [];
	const writeTools = [ ...( permissionGroups.write || [] ), ...( permissionGroups.manage || [] ) ];

	const badgesFor = ( tools: Array< [ string, McpAbility ] > ): SummaryButtonBadgeProps[] => {
		const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
		return [
			{
				text: getBadgeText( enabledCount, tools.length ),
				intent: getBadgeIntent( enabledCount, tools.length ),
			},
		];
	};

	const sitesBadges: SummaryButtonBadgeProps[] = [
		{
			text:
				disabledSiteIds.length === 0
					? __( 'No exceptions' )
					: sprintf(
							/* translators: %d is number of sites with exceptions */
							__( '%d exceptions' ),
							disabledSiteIds.length
					  ),
			intent: disabledSiteIds.length === 0 ? 'default' : 'warning',
		},
	];

	const aiAssistantSitesBadges: SummaryButtonBadgeProps[] = [
		{
			text:
				bigSkyDisabledCount === 0
					? __( 'No exceptions' )
					: sprintf(
							/* translators: %d is number of sites with exceptions */
							__( '%d exceptions' ),
							bigSkyDisabledCount
					  ),
			intent: bigSkyDisabledCount === 0 ? 'default' : 'warning',
		},
	];

	const aiAssistantEnabledBadges: SummaryButtonBadgeProps[] = [
		{
			text:
				bigSkyEnabledCount === 0
					? __( 'No sites' )
					: sprintf(
							/* translators: %d is number of sites with AI assistant enabled */
							__( '%d sites' ),
							bigSkyEnabledCount
					  ),
			intent: bigSkyEnabledCount === 0 ? 'default' : 'info',
		},
	];

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'AI and MCP' ) }
					description={ __(
						'Control how AI agents interact with your WordPress.com account and sites.'
					) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_view" />
			<VStack spacing={ 6 }>
				{ /* WordPress AI assistant */ }
				<Card
					className="dashboard-summary-button-list has-density-medium"
					style={ { position: 'relative' } }
				>
					{ bigSkyIsInitialLoading && (
						<Spinner
							style={ {
								width: 16,
								height: 16,
								margin: 0,
								position: 'absolute',
								top: 16,
								right: 16,
							} }
						/>
					) }
					<CardHeader>
						<SectionHeader
							level={ 3 }
							title={ __( 'WordPress AI assistant' ) }
							description={ __(
								'Create content, transform designs, and get instant help with AI across all your sites on paid plans.'
							) }
							actions={
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ bigSkyGlobalEnabled }
									disabled={
										bigSkyIsInitialLoading ||
										bigSkyBulkMutation.isPending ||
										bigSkyAvailableSiteIds.length === 0
									}
									onChange={ ( checked ) => bigSkyBulkMutation.mutate( { enable: checked } ) }
									label={ __( 'Enable AI assistant' ) }
								/>
							}
						/>
					</CardHeader>
					{ ! bigSkyIsInitialLoading && (
						<CardBody
							className="dashboard-summary-button-list__children-list-wrapper"
							style={
								bigSkyBulkMutation.isPending ? { opacity: 0.5, pointerEvents: 'none' } : undefined
							}
						>
							<ul className="dashboard-summary-button-list__children-list">
								<li className="dashboard-summary-button-list__children-list-item">
									{ bigSkyGlobalEnabled ? (
										<RouterLinkSummaryButton
											to="/me/preferences/ai-and-mcp/ai-assistant"
											title={ __( 'Site exceptions' ) }
											decoration={ <Icon icon={ notAllowed } /> }
											badges={ aiAssistantSitesBadges }
											density="medium"
										/>
									) : (
										<RouterLinkSummaryButton
											to="/me/preferences/ai-and-mcp/ai-assistant"
											title={ __( 'Add to specific sites' ) }
											decoration={ <Icon icon={ bigSkyIcon } /> }
											badges={ aiAssistantEnabledBadges }
											density="medium"
										/>
									) }
								</li>
							</ul>
						</CardBody>
					) }
				</Card>

				{ /* External AI agent access — toggle + MCP access sub-items */ }
				<Card className="dashboard-summary-button-list has-density-medium">
					<CardHeader>
						<SectionHeader
							level={ 3 }
							title={ __( 'External AI agent access' ) }
							description={ __(
								'Allow external AI agents to access your WordPress.com account and sites via MCP.'
							) }
							actions={
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ anyToolsEnabled }
									disabled={ mutation.isPending }
									onChange={ handleToggleAll }
									label={ __( 'Enable MCP access' ) }
								/>
							}
						/>
					</CardHeader>
					{ hasTools && anyToolsEnabled && (
						<CardBody
							className="dashboard-summary-button-list__children-list-wrapper"
							style={ mutation.isPending ? { opacity: 0.5, pointerEvents: 'none' } : undefined }
						>
							<ul className="dashboard-summary-button-list__children-list">
								{ readTools.length > 0 && (
									<li className="dashboard-summary-button-list__children-list-item">
										<RouterLinkSummaryButton
											key="read"
											to="/me/preferences/ai-and-mcp/tools/read"
											title={ __( 'Read' ) }
											decoration={ <Icon icon={ seen } /> }
											badges={ badgesFor( readTools ) }
											density="medium"
										/>
									</li>
								) }
								{ writeTools.length > 0 && (
									<li className="dashboard-summary-button-list__children-list-item">
										<RouterLinkSummaryButton
											key="write"
											to="/me/preferences/ai-and-mcp/tools/write"
											title={ __( 'Write' ) }
											decoration={ <Icon icon={ pencil } /> }
											badges={ badgesFor( writeTools ) }
											density="medium"
										/>
									</li>
								) }
								<li className="dashboard-summary-button-list__children-list-item">
									<RouterLinkSummaryButton
										to="/me/preferences/ai-and-mcp/sites"
										title={ __( 'Site exceptions' ) }
										decoration={ <Icon icon={ notAllowed } /> }
										badges={ sitesBadges }
										density="medium"
									/>
								</li>
							</ul>
						</CardBody>
					) }
				</Card>

				{ /* Connect AI agent — only shown when MCP access is on */ }
				{ hasTools && anyToolsEnabled && (
					<div style={ mutation.isPending ? { opacity: 0.5, pointerEvents: 'none' } : undefined }>
						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/setup"
							title={ __( 'Connect external AI agent' ) }
							description={ __( 'Get instructions for connecting your external AI agent.' ) }
							decoration={ <Icon icon={ connection } /> }
						/>
					</div>
				) }
			</VStack>
		</PageLayout>
	);
}

export default McpComponent;

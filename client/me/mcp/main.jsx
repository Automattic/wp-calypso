import { updateBigSkyPlugin, updateUserSettings } from '@automattic/api-core';
import {
	bigSkyPluginQuery,
	siteQueryFilter,
	sitesQuery,
	userSettingsQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import SummaryButton from '@automattic/components/src/summary-button';
import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	ToggleControl,
	Card,
	CardBody,
	CardHeader,
	Icon,
	Spinner,
} from '@wordpress/components';
import { connection, notAllowed, seen, pencil } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { SectionHeader } from '../../dashboard/components/section-header';
import { getPermissionLevel } from '../../dashboard/me/mcp/categories';
import { getAccountMcpAbilities, getDisabledSiteIds } from './utils';

// Big Sky star icon — paths from BigSkyLogo.CentralLogo (heartless variant)
// without explicit fill attributes so CSS hover color changes work via `currentColor`.
const bigSkyIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="m19.223 11.55-3.095-1.068a4.21 4.21 0 0 1-2.61-2.61L12.45 4.777c-.145-.426-.755-.426-.9 0l-1.068 3.095a4.21 4.21 0 0 1-2.61 2.61L4.777 11.55c-.426.145-.426.755 0 .9l3.095 1.068a4.21 4.21 0 0 1 2.61 2.61l1.068 3.095c.145.426.755.426.9 0l1.068-3.095a4.21 4.21 0 0 1 2.61-2.61l3.095-1.068c.426-.145.426-.755 0-.9Zm-3.613.68-1.547.533a2.105 2.105 0 0 0-1.306 1.305l-.533 1.548a.24.24 0 0 1-.453 0l-.534-1.548a2.105 2.105 0 0 0-1.305-1.305l-1.548-.534a.24.24 0 0 1 0-.453l1.548-.534a2.105 2.105 0 0 0 1.305-1.305l.534-1.547a.24.24 0 0 1 .453 0l.534 1.547c.21.615.695 1.095 1.305 1.305l1.547.534a.24.24 0 0 1 0 .453Z" />
	</svg>
);

function McpComponent( { path } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const tanstackQueryClient = useQueryClient();

	const { data: sites = [] } = useQuery( sitesQuery( 'all', { site_visibility: 'visible' } ) );
	const {
		data: userSettings,
		isLoading: isLoadingUserSettings,
		error: userSettingsError,
	} = useQuery( userSettingsQuery() );

	// Fetch BigSky plugin status for all sites (AI assistant card)
	const bigSkyQueries = useQueries( {
		queries: sites.map( ( site ) => ( {
			...bigSkyPluginQuery( site.ID ),
			enabled: sites.length > 0,
		} ) ),
	} );

	// Compute AI assistant stats across all sites
	const bigSkyAvailableSiteIds = [];
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

	const bigSkyHasAnyData = bigSkyQueries.some( ( q ) => q.data !== undefined );
	const bigSkyIsFetching = bigSkyQueries.some( ( q ) => q.isFetching );
	const bigSkyIsInitialLoading = ! bigSkyHasAnyData && bigSkyIsFetching;

	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );

	// Reauth state
	const [ reauthRequired, setReauthRequired ] = useState( false );
	useEffect( () => {
		const checkReauth = () => {
			const reauth = twoStepAuthorization.isReauthRequired();
			setReauthRequired( reauth );
		};
		twoStepAuthorization.on( 'change', checkReauth );
		checkReauth();
		return () => twoStepAuthorization.off( 'change', checkReauth );
	}, [] );

	// Bulk MCP toggle: sends all tool updates in a single API call.
	const toggleAllRef = useRef( false );
	const mutation = useMutation( {
		mutationFn: async ( payload ) => {
			const { account, sites: sitesPayload } = payload;
			const apiPayload = { mcp_abilities: { account } };
			if ( sitesPayload?.length ) {
				apiPayload.mcp_abilities.sites = sitesPayload;
			}
			await updateUserSettings( apiPayload );
		},
		onSuccess: ( _data, payload ) => {
			// Batch-update the cache based on intent so the UI updates in one render.
			tanstackQueryClient.setQueryData( userSettingsQuery().queryKey, ( oldData ) => {
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
			tanstackQueryClient.invalidateQueries( { queryKey: userSettingsQuery().queryKey } );
			reduxDispatch(
				successNotice( translate( 'MCP settings saved.' ), { id: 'mcp-settings-saved' } )
			);
		},
		onError: () => {
			reduxDispatch(
				errorNotice( translate( 'Failed to save MCP settings.' ), { id: 'mcp-settings-error' } )
			);
		},
		onSettled: () => {
			toggleAllRef.current = false;
		},
	} );

	// Bulk toggle AI assistant for all eligible sites
	const bigSkyBulkMutation = useMutation( {
		mutationFn: async ( { enable } ) => {
			await Promise.all(
				bigSkyAvailableSiteIds.map( ( siteId ) => updateBigSkyPlugin( siteId, { enable } ) )
			);
		},
		onSuccess: ( _data, { enable } ) => {
			// Batch-update all caches at once so counts change in a single render.
			bigSkyAvailableSiteIds.forEach( ( siteId ) => {
				tanstackQueryClient.setQueryData( bigSkyPluginQuery( siteId ).queryKey, ( old ) =>
					old ? { ...old, enabled: enable } : old
				);
			} );
			// Invalidate for background server sync.
			bigSkyAvailableSiteIds.forEach( ( siteId ) => {
				tanstackQueryClient.invalidateQueries( {
					queryKey: bigSkyPluginQuery( siteId ).queryKey,
				} );
				tanstackQueryClient.invalidateQueries( siteQueryFilter( siteId ) );
			} );
			reduxDispatch(
				successNotice( translate( 'AI assistant settings saved.' ), {
					id: 'bigsky-settings-saved',
				} )
			);
		},
		onError: () => {
			reduxDispatch(
				errorNotice( translate( 'Failed to save AI assistant settings.' ), {
					id: 'bigsky-settings-error',
				} )
			);
		},
	} );

	if ( userSettingsError ) {
		return null;
	}

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = Object.entries( mcpAbilities );
	const hasTools = availableTools.length > 0;
	const enabledToolsCount = Object.values( mcpAbilities ).filter( ( tool ) => tool.enabled ).length;
	const anyToolsEnabled = enabledToolsCount > 0;

	const handleToggleAll = ( enabled ) => {
		if ( toggleAllRef.current ) {
			return;
		}
		toggleAllRef.current = true;

		// Only send tools that need to change state — reduces payload and
		// number of API calls needed.
		const accountAbilities = {};
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
					? disabledSiteIds.map( ( siteId ) => ( {
							blog_id: siteId,
							account_tools_enabled: true,
					  } ) )
					: undefined,
		} );
	};

	// Shared helper: compute badge text for a set of tools.
	const getBadgeText = ( enabledCount, totalCount ) => {
		if ( enabledCount === totalCount ) {
			return translate( 'All enabled' );
		}
		if ( enabledCount === 0 ) {
			return translate( 'Disabled' );
		}
		return translate( '%(enabledCount)d of %(totalCount)d enabled', {
			args: { enabledCount, totalCount },
		} );
	};

	// Shared helper: compute badge intent for a set of tools.
	const getBadgeIntent = ( enabledCount, totalCount ) => {
		if ( enabledCount === totalCount ) {
			return 'success';
		}
		if ( enabledCount > 0 ) {
			return 'info';
		}
		return 'default';
	};

	// Group tools by permission level, merging Write + Manage
	const permissionGroups = {};
	availableTools.forEach( ( [ toolId, tool ] ) => {
		const level = getPermissionLevel( tool );
		if ( ! permissionGroups[ level ] ) {
			permissionGroups[ level ] = [];
		}
		permissionGroups[ level ].push( [ toolId, tool ] );
	} );

	const readTools = permissionGroups.read || [];
	const writeTools = [ ...( permissionGroups.write || [] ), ...( permissionGroups.manage || [] ) ];

	const badgesFor = ( tools ) => {
		const count = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
		return [
			{
				text: getBadgeText( count, tools.length ),
				intent: getBadgeIntent( count, tools.length ),
			},
		];
	};

	const sitesBadges = [
		{
			text:
				disabledSiteIds.length === 0
					? translate( 'No exceptions' )
					: translate( '%(count)d exceptions', {
							args: { count: disabledSiteIds.length },
					  } ),
			intent: disabledSiteIds.length === 0 ? 'default' : 'warning',
		},
	];

	const aiAssistantSitesBadges = [
		{
			text:
				bigSkyDisabledCount === 0
					? translate( 'No exceptions' )
					: translate( '%(count)d exceptions', {
							args: { count: bigSkyDisabledCount },
					  } ),
			intent: bigSkyDisabledCount === 0 ? 'default' : 'warning',
		},
	];

	const aiAssistantEnabledBadges = [
		{
			text:
				bigSkyEnabledCount === 0
					? translate( 'No sites' )
					: translate( '%(count)d sites', {
							args: { count: bigSkyEnabledCount },
					  } ),
			intent: bigSkyEnabledCount === 0 ? 'default' : 'info',
		},
	];

	// Check if MCP settings feature is enabled
	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return (
		<Main wideLayout className="mcp">
			<PageViewTracker path={ path } title="AI and MCP" />
			<DocumentHead title={ translate( 'AI and MCP' ) } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'AI and MCP' ) }
				subtitle={ translate(
					'Control how AI agents interact with your WordPress.com account and sites.'
				) }
			/>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! isLoadingUserSettings && ! reauthRequired && (
				<VStack spacing={ 6 }>
					{ /* WordPress AI assistant */ }
					<Card
						isRounded={ false }
						className="dashboard-summary-button-list has-density-medium"
						style={ { position: 'relative', borderRadius: 0 } }
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
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ translate( 'WordPress AI assistant' ) }
									description={ translate(
										'Create content, transform designs, and get instant help with AI across all your sites on paid plans.'
									) }
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ bigSkyGlobalEnabled }
									disabled={
										bigSkyIsInitialLoading ||
										bigSkyBulkMutation.isPending ||
										bigSkyAvailableSiteIds.length === 0
									}
									onChange={ ( checked ) => bigSkyBulkMutation.mutate( { enable: checked } ) }
									label={ translate( 'Enable AI assistant' ) }
								/>
							</VStack>
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
											<SummaryButton
												href="/me/mcp-ai-assistant"
												title={ translate( 'Site exceptions' ) }
												decoration={ <Icon icon={ notAllowed } /> }
												badges={ aiAssistantSitesBadges }
												density="medium"
											/>
										) : (
											<SummaryButton
												href="/me/mcp-ai-assistant"
												title={ translate( 'Add to specific sites' ) }
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

					{ /* External AI agent access */ }
					<Card
						isRounded={ false }
						className="dashboard-summary-button-list has-density-medium"
						style={ { borderRadius: 0 } }
					>
						<CardHeader>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ translate( 'External AI agent access' ) }
									description={ translate(
										'Allow external AI agents to access your WordPress.com account and sites via MCP.'
									) }
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ anyToolsEnabled }
									disabled={ mutation.isPending }
									onChange={ handleToggleAll }
									label={ translate( 'Enable MCP access' ) }
								/>
							</VStack>
						</CardHeader>
						{ hasTools && anyToolsEnabled && (
							<CardBody
								className="dashboard-summary-button-list__children-list-wrapper"
								style={ mutation.isPending ? { opacity: 0.5, pointerEvents: 'none' } : undefined }
							>
								<ul className="dashboard-summary-button-list__children-list">
									{ readTools.length > 0 && (
										<li className="dashboard-summary-button-list__children-list-item">
											<SummaryButton
												key="read"
												href="/me/mcp-tools/read"
												title={ translate( 'Read' ) }
												decoration={ <Icon icon={ seen } /> }
												badges={ badgesFor( readTools ) }
												density="medium"
											/>
										</li>
									) }
									{ writeTools.length > 0 && (
										<li className="dashboard-summary-button-list__children-list-item">
											<SummaryButton
												key="write"
												href="/me/mcp-tools/write"
												title={ translate( 'Write' ) }
												decoration={ <Icon icon={ pencil } /> }
												badges={ badgesFor( writeTools ) }
												density="medium"
											/>
										</li>
									) }
									<li className="dashboard-summary-button-list__children-list-item">
										<SummaryButton
											href="/me/mcp-sites"
											title={ translate( 'Site exceptions' ) }
											decoration={ <Icon icon={ notAllowed } /> }
											badges={ sitesBadges }
											density="medium"
										/>
									</li>
								</ul>
							</CardBody>
						) }
					</Card>

					{ /* Connect AI agent */ }
					{ hasTools && anyToolsEnabled && (
						<div style={ mutation.isPending ? { opacity: 0.5, pointerEvents: 'none' } : undefined }>
							<SummaryButton
								href="/me/mcp-setup"
								title={ translate( 'Connect external AI agent' ) }
								description={ translate(
									'Get instructions for connecting your external AI agent.'
								) }
								decoration={ <Icon icon={ connection } /> }
								style={ { borderRadius: 0 } }
							/>
						</div>
					) }
				</VStack>
			) }
		</Main>
	);
}

export default McpComponent;

/**
 * EXPLORATION FILE — Disposable UI for trying different options.
 * Original file: main.jsx (untouched)
 *
 * Toggle between variations using the "Explorations" menu
 * that appears next to the DEV badge (bottom-right of screen).
 *
 * Option 1 — Baseline: Current screen (everything on one page, all toggles visible)
 * Option 2 — Hub: Master toggle + summary cards linking to sub-pages (matches Security pattern)
 * Option 3 — Flat: Medium-density permission-level links (Read/Write/Manage) inline
 * Option 4 — Action: ActionList pattern with capability descriptions
 * Option 5 — Accordion: PanelBody collapsible sections on sub-pages
 * Option 6 — Toggle Header: SectionHeader with Enable all toggle on sub-pages
 * Option 7 — AI Assistant: WordPress.com AI assistant card + external AI access card
 */
import { updateBigSkyPlugin } from '@automattic/api-core';
import {
	bigSkyPluginQuery,
	siteQueryFilter,
	sitesQuery,
	userSettingsQuery,
	userSettingsMutation,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import SummaryButton from '@automattic/components/src/summary-button';
import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	ToggleControl,
	Card,
	CardBody,
	CardHeader,
	Button,
	Icon,
	Spinner,
} from '@wordpress/components';
import { connection, lock, notAllowed, unseen, seen, pencil } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import ExplorationsHelper from '../../dashboard/app/explorations-helper';
import { ActionList } from '../../dashboard/components/action-list';
import { SectionHeader } from '../../dashboard/components/section-header';
import { SummaryButtonList } from '../../dashboard/components/summary-button-list';
import {
	CATEGORY_ORDER,
	getDisplayCategory,
	getPermissionLevel,
} from '../../dashboard/me/mcp/categories';
import { getAccountMcpAbilities, getDisabledSiteIds } from './utils';

// Big Sky star icon — paths from BigSkyLogo.CentralLogo (heartless variant)
// without explicit fill attributes so CSS hover color changes work via `currentColor`.
const bigSkyIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="m19.223 11.55-3.095-1.068a4.21 4.21 0 0 1-2.61-2.61L12.45 4.777c-.145-.426-.755-.426-.9 0l-1.068 3.095a4.21 4.21 0 0 1-2.61 2.61L4.777 11.55c-.426.145-.426.755 0 .9l3.095 1.068a4.21 4.21 0 0 1 2.61 2.61l1.068 3.095c.145.426.755.426.9 0l1.068-3.095a4.21 4.21 0 0 1 2.61-2.61l3.095-1.068c.426-.145.426-.755 0-.9Zm-3.613.68-1.547.533a2.105 2.105 0 0 0-1.306 1.305l-.533 1.548a.24.24 0 0 1-.453 0l-.534-1.548a2.105 2.105 0 0 0-1.305-1.305l-1.548-.534a.24.24 0 0 1 0-.453l1.548-.534a2.105 2.105 0 0 0 1.305-1.305l.534-1.547a.24.24 0 0 1 .453 0l.534 1.547c.21.615.695 1.095 1.305 1.305l1.547.534a.24.24 0 0 1 0 .453Z" />
	</svg>
);

// ─── Exploration Options ────────────────────────────────────────────────────

const EXPLORATIONS_STORAGE_KEY = 'mcp-explore-variation';

const VARIATIONS = [
	{ key: 'A', label: 'Option 1 — Baseline' },
	{ key: 'B', label: 'Option 2 — Hub' },
	{ key: 'C', label: 'Option 3 — Flat' },
	{ key: 'D', label: 'Option 4 — Action' },
	{ key: 'E', label: 'Option 5' },
	{ key: 'F', label: 'Option 6' },
	{ key: 'G', label: 'Option 7' },
];

// Subscribe to localStorage changes from the global ExplorationsHelper.
let listeners = [];
function subscribeToVariation( callback ) {
	listeners.push( callback );
	const interval = setInterval( callback, 200 );
	return () => {
		listeners = listeners.filter( ( l ) => l !== callback );
		clearInterval( interval );
	};
}
function getVariationSnapshot() {
	const stored = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
	return stored && VARIATIONS.some( ( v ) => v.key === stored ) ? stored : 'A';
}

// ─── Main Component ─────────────────────────────────────────────────────────

function McpComponentExplore( { path } ) {
	const translate = useTranslate();
	const variation = useSyncExternalStore( subscribeToVariation, getVariationSnapshot );
	const reduxDispatch = useDispatch();
	const tanstackQueryClient = useQueryClient();

	const { data: sites = [] } = useQuery( sitesQuery( 'all', { site_visibility: 'visible' } ) );
	const {
		data: userSettings,
		isLoading: isLoadingUserSettings,
		error: userSettingsError,
	} = useQuery( userSettingsQuery() );

	// Fetch BigSky plugin status for all sites (used by Option 7's AI assistant card)
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
	const disabledSites = disabledSiteIds.map( ( siteId ) => {
		const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
		const name = site?.name || translate( 'Site ID: %(siteId)s', { args: { siteId } } );
		const domain = site?.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
		return { id: siteId, name, domain };
	} );

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

	const mutation = useMutation( {
		...userSettingsMutation(),
		onSuccess: ( newData ) => {
			tanstackQueryClient.setQueryData( userSettingsQuery().queryKey, newData );
			reduxDispatch(
				successNotice( translate( 'MCP settings saved.' ), { id: 'mcp-settings-saved' } )
			);
		},
		onError: () => {
			reduxDispatch(
				errorNotice( translate( 'Failed to save MCP settings.' ), { id: 'mcp-settings-error' } )
			);
		},
	} );

	// Bulk toggle AI assistant for all eligible sites
	const bigSkyBulkMutation = useMutation( {
		mutationFn: async ( { enable } ) => {
			await Promise.all(
				bigSkyAvailableSiteIds.map( ( siteId ) => updateBigSkyPlugin( siteId, { enable } ) )
			);
		},
		onSuccess: () => {
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

	const handleToolChange = ( toolId, enabled ) => {
		mutation.mutate( { mcp_abilities: { account: { [ toolId ]: enabled } } } );
	};

	const handleToggleAll = ( enabled ) => {
		const accountAbilities = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			if ( enabled ) {
				const level = getPermissionLevel( mcpAbilities[ toolId ] );
				accountAbilities[ toolId ] = level === 'read';
			} else {
				accountAbilities[ toolId ] = false;
			}
		} );

		// Option G: also clear site exceptions when toggling
		const mutationPayload = { mcp_abilities: { account: accountAbilities } };
		if ( variation === 'G' && disabledSiteIds.length > 0 ) {
			mutationPayload.mcp_abilities.sites = disabledSiteIds.map( ( siteId ) => ( {
				blog_id: siteId,
				account_tools_enabled: true,
			} ) );
		}
		mutation.mutate( mutationPayload );
	};

	const handleSiteToggle = ( siteId, enabled ) => {
		mutation.mutate( {
			mcp_abilities: { sites: [ { blog_id: siteId, account_tools_enabled: enabled } ] },
		} );
	};

	const groupToolsByCategory = ( tools ) => {
		const grouped = {};
		tools.forEach( ( [ toolId, tool ] ) => {
			const displayCategory = getDisplayCategory( toolId, tool );
			if ( ! grouped[ displayCategory ] ) {
				grouped[ displayCategory ] = [];
			}
			grouped[ displayCategory ].push( [ toolId, tool ] );
		} );
		return grouped;
	};

	// Shared helpers
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

	const getBadgeIntent = ( enabledCount, totalCount ) => {
		if ( enabledCount === totalCount ) {
			return 'success';
		}
		if ( enabledCount > 0 ) {
			return 'info';
		}
		return 'default';
	};

	// ─── Layout Wrapper ─────────────────────────────────────────────

	const renderLayout = ( children ) => (
		<Main wideLayout className="mcp">
			<ExplorationsHelper />
			<PageViewTracker path={ path } title="MCP Account Settings" />
			<DocumentHead title={ translate( 'MCP Account Settings' ) } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'AI and MCP' ) }
				subtitle={ translate(
					'Control how AI assistants interact with your WordPress.com account and sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="mcp" showIcon={ false } />,
						},
					}
				) }
			/>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! isLoadingUserSettings && ! reauthRequired && children }
		</Main>
	);

	// ─── Shared: tools section with categories (for Variation A) ────

	const renderToolsSection = ( tools ) => {
		if ( ! tools || tools.length === 0 ) {
			return null;
		}
		const groupedTools = groupToolsByCategory( tools );
		return (
			<Card isRounded={ false }>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ translate( 'What the AI can access' ) }
							description={ translate(
								'Control which parts of your account and sites the AI is allowed to use.'
							) }
						/>
						<VStack spacing={ 4 }>
							{ CATEGORY_ORDER.map( ( categoryName ) => {
								const categoryTools = groupedTools[ categoryName ];
								if ( ! categoryTools || categoryTools.length === 0 ) {
									return null;
								}
								return (
									<VStack key={ categoryName } spacing={ 4 }>
										<Text
											as="h4"
											size="11px"
											weight={ 500 }
											style={ { textTransform: 'uppercase' } }
										>
											{ categoryName }
										</Text>
										<VStack spacing={ 4 }>
											{ categoryTools.map( ( [ toolId, tool ] ) => (
												<ToggleControl
													key={ toolId }
													__nextHasNoMarginBottom
													checked={ tool.enabled }
													disabled={ mutation.isPending }
													label={ tool.title }
													help={ tool.description }
													onChange={ ( checked ) => handleToolChange( toolId, checked ) }
												/>
											) ) }
										</VStack>
									</VStack>
								);
							} ) }
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		);
	};

	// ─── Variation A: Baseline ───────────────────────────────────────

	const renderVariationA = () => {
		return (
			<VStack spacing={ 8 }>
				<Card isRounded={ false }>
					<CardBody>
						<VStack spacing={ 4 }>
							<HStack justify="space-between" alignment="top">
								<SectionHeader
									level={ 3 }
									title={ translate( 'AI access' ) }
									description={ translate(
										'Allow external AI assistants to access your WordPress.com account and sites via MCP.'
									) }
								/>
								<VStack style={ { flexShrink: 0 } }>
									<Button variant="secondary" href="/me/mcp-setup" disabled={ ! anyToolsEnabled }>
										{ translate( 'Configure MCP Client' ) }
									</Button>
								</VStack>
							</HStack>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={
									<Text>
										{ anyToolsEnabled
											? translate( 'Disable AI access' )
											: translate( 'Enable AI access' ) }
									</Text>
								}
							/>
						</VStack>
					</CardBody>
				</Card>

				{ hasTools && anyToolsEnabled && (
					<Card isRounded={ false }>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ translate( 'Site-specific MCP settings' ) }
									description={ translate(
										'Choose sites to manage AI access for all users on those sites. This overrides your account settings.'
									) }
								/>
								{ disabledSites.length > 0 && (
									<VStack spacing={ 4 }>
										<SectionHeader
											level={ 3 }
											title={ translate( 'Sites with disabled MCP access' ) }
											description={ translate(
												'Sites with disabled MCP access are not accessible to AI assistants.'
											) }
										/>
										<VStack spacing={ 2 }>
											{ disabledSites.map( ( site ) => (
												<ToggleControl
													key={ site.id }
													__nextHasNoMarginBottom
													checked={ false }
													disabled={ mutation.isPending }
													onChange={ ( enabled ) => handleSiteToggle( site.id, enabled ) }
													label={ site.name }
													help={ site.domain }
												/>
											) ) }
										</VStack>
									</VStack>
								) }
							</VStack>
						</CardBody>
					</Card>
				) }

				{ hasTools && renderToolsSection( availableTools ) }
			</VStack>
		);
	};

	// ─── Variation B: Hub-and-spoke ──────────────────────────────────

	const renderVariationB = () => {
		const toolsBadges = [
			{
				text: getBadgeText( enabledToolsCount, availableTools.length ),
				intent: getBadgeIntent( enabledToolsCount, availableTools.length ),
			},
		];

		return (
			<VStack spacing={ 6 }>
				<Card isRounded={ false }>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ translate( 'AI access' ) }
								description={ translate(
									'Allow external AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ translate( 'Enable AI access' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ hasTools && anyToolsEnabled && (
					<>
						<SummaryButton
							href="/me/mcp-tools"
							title={ translate( 'MCP access' ) }
							description={ translate(
								'Control what your external AI assistant can do on your account and sites.'
							) }
							decoration={ <Icon icon={ lock } /> }
							badges={ toolsBadges }
						/>

						<SummaryButton
							href="/me/mcp-setup"
							title={ translate( 'Connect AI assistant' ) }
							description={ translate(
								'Get instructions for connecting your external AI assistant.'
							) }
							decoration={ <Icon icon={ connection } /> }
						/>
					</>
				) }
			</VStack>
		);
	};

	// ─── Variation C: Flat — permission-level links inline ───────────

	const renderVariationC = () => {
		const permissionGroups = {};
		availableTools.forEach( ( [ toolId, tool ] ) => {
			const level = getPermissionLevel( tool );
			if ( ! permissionGroups[ level ] ) {
				permissionGroups[ level ] = [];
			}
			permissionGroups[ level ].push( [ toolId, tool ] );
		} );

		const readTools = permissionGroups.read || [];
		const writeTools = [
			...( permissionGroups.write || [] ),
			...( permissionGroups.manage || [] ),
		];

		const badgesFor = ( tools ) => {
			const count = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
			return [
				{
					text: getBadgeText( count, tools.length ),
					intent: getBadgeIntent( count, tools.length ),
				},
			];
		};

		const sitesBadgesC = [
			{
				text:
					disabledSiteIds.length === 0
						? translate( 'No restrictions' )
						: translate( '%(count)d restricted', {
								args: { count: disabledSiteIds.length },
						  } ),
				intent: disabledSiteIds.length === 0 ? 'default' : 'warning',
			},
		];

		return (
			<VStack spacing={ 6 }>
				<Card isRounded={ false }>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ translate( 'AI access' ) }
								description={ translate(
									'Allow external AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ translate( 'Enable AI access' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ hasTools && anyToolsEnabled && (
					<>
						<SummaryButtonList
							title={ translate( 'MCP access' ) }
							description={ translate(
								'Control what your external AI assistant can do on your account and sites.'
							) }
							density="medium"
						>
							{ readTools.length > 0 && (
								<SummaryButton
									key="read"
									href="/me/mcp-tools/read"
									title={ translate( 'Read' ) }
									decoration={ <Icon icon={ seen } /> }
									badges={ badgesFor( readTools ) }
								/>
							) }
							{ writeTools.length > 0 && (
								<SummaryButton
									key="write"
									href="/me/mcp-tools/write"
									title={ translate( 'Write' ) }
									decoration={ <Icon icon={ pencil } /> }
									badges={ badgesFor( writeTools ) }
								/>
							) }
							<SummaryButton
								href="/me/mcp-sites"
								title={ translate( 'Site restrictions' ) }
								description={ translate( 'Restrict AI access for specific sites.' ) }
								decoration={ <Icon icon={ unseen } /> }
								badges={ sitesBadgesC }
							/>
						</SummaryButtonList>

						<SummaryButton
							href="/me/mcp-setup"
							title={ translate( 'Connect AI assistant' ) }
							description={ translate(
								'Get instructions for connecting your external AI assistant.'
							) }
							decoration={ <Icon icon={ connection } /> }
						/>
					</>
				) }
			</VStack>
		);
	};

	// ─── Variation D: ActionList ─────────────────────────────────────

	const renderVariationD = () => {
		const permissionGroups = {};
		availableTools.forEach( ( [ toolId, tool ] ) => {
			const level = getPermissionLevel( tool );
			if ( ! permissionGroups[ level ] ) {
				permissionGroups[ level ] = [];
			}
			permissionGroups[ level ].push( [ toolId, tool ] );
		} );

		const readTools = permissionGroups.read || [];
		const writeTools = [
			...( permissionGroups.write || [] ),
			...( permissionGroups.manage || [] ),
		];

		return (
			<VStack spacing={ 6 }>
				<Card isRounded={ false }>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ translate( 'AI access' ) }
								description={ translate(
									'Allow external AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ translate( 'Enable AI access' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ hasTools && anyToolsEnabled && (
					<>
						<ActionList
							title={ translate( 'MCP access' ) }
							description={ translate(
								'Control what your external AI assistant can do on your account and sites.'
							) }
						>
							{ readTools.length > 0 && (
								<ActionList.ActionItem
									key="read"
									title={ translate( 'Read' ) }
									description={ translate( 'View your sites, posts, and account info.' ) }
									actions={
										<Button variant="secondary" size="compact" href="/me/mcp-tools/read">
											{ translate( 'Manage' ) }
										</Button>
									}
								/>
							) }
							{ writeTools.length > 0 && (
								<ActionList.ActionItem
									key="write"
									title={ translate( 'Write' ) }
									description={ translate(
										'Create, edit, and delete content, plugins, and settings.'
									) }
									actions={
										<Button variant="secondary" size="compact" href="/me/mcp-tools/write">
											{ translate( 'Manage' ) }
										</Button>
									}
								/>
							) }
							<ActionList.ActionItem
								title={ translate( 'Site restrictions' ) }
								description={ translate( 'Restrict AI access for specific sites.' ) }
								actions={
									<Button variant="secondary" size="compact" href="/me/mcp-sites">
										{ translate( 'Manage' ) }
									</Button>
								}
							/>
						</ActionList>

						<ActionList>
							<ActionList.ActionItem
								title={ translate( 'Connect AI assistant' ) }
								description={ translate(
									'Get instructions for connecting your external AI assistant.'
								) }
								actions={
									<Button variant="secondary" size="compact" href="/me/mcp-setup">
										{ translate( 'Setup' ) }
									</Button>
								}
							/>
						</ActionList>
					</>
				) }
			</VStack>
		);
	};

	// ─── Variations E & F: Same top-level as C (sub-pages differ) ───

	const renderVariationE = () => renderVariationC();
	const renderVariationF = () => renderVariationC();

	// ─── Variation G: AI Assistant + External AI access ──────────────

	const renderVariationG = () => {
		const permissionGroups = {};
		availableTools.forEach( ( [ toolId, tool ] ) => {
			const level = getPermissionLevel( tool );
			if ( ! permissionGroups[ level ] ) {
				permissionGroups[ level ] = [];
			}
			permissionGroups[ level ].push( [ toolId, tool ] );
		} );

		const readTools = permissionGroups.read || [];
		const writeTools = [
			...( permissionGroups.write || [] ),
			...( permissionGroups.manage || [] ),
		];

		const badgesFor = ( tools ) => {
			const count = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
			return [
				{
					text: getBadgeText( count, tools.length ),
					intent: getBadgeIntent( count, tools.length ),
				},
			];
		};

		const sitesBadgesG = [
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

		return (
			<VStack spacing={ 6 }>
				{ /* WordPress.com AI assistant */ }
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
								title={ translate( 'WordPress.com AI assistant' ) }
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
						<CardBody className="dashboard-summary-button-list__children-list-wrapper">
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

				{ /* External AI assistant access */ }
				<Card
					isRounded={ false }
					className="dashboard-summary-button-list has-density-medium"
					style={ { borderRadius: 0 } }
				>
					<CardHeader>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ translate( 'External AI assistant access' ) }
								description={ translate(
									'Allow external AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ translate( 'Enable MCP access' ) }
							/>
						</VStack>
					</CardHeader>
					{ hasTools && anyToolsEnabled && (
						<CardBody className="dashboard-summary-button-list__children-list-wrapper">
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
										badges={ sitesBadgesG }
										density="medium"
									/>
								</li>
							</ul>
						</CardBody>
					) }
				</Card>

				{ /* Connect AI assistant */ }
				{ hasTools && anyToolsEnabled && (
					<SummaryButton
						href="/me/mcp-setup"
						title={ translate( 'Connect external AI assistant' ) }
						description={ translate(
							'Get instructions for connecting your external AI assistant.'
						) }
						decoration={ <Icon icon={ connection } /> }
						style={ { borderRadius: 0 } }
					/>
				) }
			</VStack>
		);
	};

	// ─── Variation Router ───────────────────────────────────────────

	const renderCurrentVariation = () => {
		switch ( variation ) {
			case 'A':
				return renderVariationA();
			case 'B':
				return renderVariationB();
			case 'C':
				return renderVariationC();
			case 'D':
				return renderVariationD();
			case 'E':
				return renderVariationE();
			case 'F':
				return renderVariationF();
			case 'G':
				return renderVariationG();
			default:
				return renderVariationA();
		}
	};

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return renderLayout( renderCurrentVariation() );
}

export default McpComponentExplore;

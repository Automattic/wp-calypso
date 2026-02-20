/**
 * EXPLORATION FILE — Disposable UI for trying different options.
 * Original file: index.tsx (untouched)
 *
 * Toggle between variations using the "Explorations" menu
 * that appears next to the DEV badge (bottom-right of screen).
 *
 * Option 1 — Baseline: Current screen (everything on one page, all toggles visible)
 * Option 2 — Hub: Master toggle + summary cards linking to sub-pages (matches Security pattern)
 * Option 3 — Flat: Medium-density permission-level links (Read/Write/Manage) inline, skipping the tools sub-page
 * Option 4 — Action: Copy of Option 3 for further iteration
 */
import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
	__experimentalHStack as HStack,
	FormTokenField,
	Icon,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { connection, lock, unseen, seen, pencil } from '@wordpress/icons';
import { useState, useSyncExternalStore } from 'react';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getSiteAccountToolsEnabled,
} from '../../../me/mcp/utils';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { EXPLORATIONS_STORAGE_KEY } from '../../app/explorations-helper';
import { ActionList } from '../../components/action-list';
import { Card, CardBody } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import { getSiteDisplayName } from '../../utils/site-name';
import { CATEGORY_ORDER, getDisplayCategory, getPermissionLevel } from './categories';
import type { Site } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

// ─── Exploration Options ────────────────────────────────────────────────────

const VARIATIONS = [
	{ key: 'A', label: 'Option 1 — Baseline' },
	{ key: 'B', label: 'Option 2 — Hub' },
	{ key: 'C', label: 'Option 3 — Flat' },
	{ key: 'D', label: 'Option 4 — Action' },
] as const;

type VariationKey = ( typeof VARIATIONS )[ number ][ 'key' ];

// Subscribe to localStorage changes from the global ExplorationsHelper.
// The global helper (rendered in Root) writes to localStorage; this page reads it.
let listeners: Array< () => void > = [];
function subscribeToVariation( callback: () => void ) {
	listeners.push( callback );
	// Poll localStorage so we pick up same-window writes from the global helper's
	// separate React root (storage events only fire across tabs).
	const interval = setInterval( callback, 200 );
	return () => {
		listeners = listeners.filter( ( l ) => l !== callback );
		clearInterval( interval );
	};
}
function getVariationSnapshot(): VariationKey {
	const stored = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
	return stored && VARIATIONS.some( ( v ) => v.key === stored ) ? ( stored as VariationKey ) : 'A';
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	annotations?: Record< string, unknown >;
}

// ─── Main Component ─────────────────────────────────────────────────────────

function McpComponentExplore() {
	const variation = useSyncExternalStore( subscribeToVariation, getVariationSnapshot );

	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const [ selectedSiteIds, setSelectedSiteIds ] = useState< number[] >( [] );
	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const disabledSites = disabledSiteIds.map( ( siteId ) => {
		const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
		const name = site
			? getSiteDisplayName( site )
			: /* translators: %s is the numeric site ID */
			  sprintf( __( 'Site ID: %s' ), String( siteId ) );
		const domain = site?.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
		return { id: siteId, name, domain };
	} );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = Object.entries( mcpAbilities );
	const hasTools = availableTools.length > 0;
	const enabledToolsCount = Object.values( mcpAbilities ).filter( ( tool ) => tool.enabled ).length;
	const anyToolsEnabled = enabledToolsCount > 0;

	const handleToolChange = ( toolId: string, enabled: boolean ) => {
		mutation.mutate( { mcp_abilities: { account: { [ toolId ]: enabled } } } as any );
	};

	const handleToggleAll = ( enabled: boolean ) => {
		const accountAbilities: Record< string, boolean > = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			accountAbilities[ toolId ] = enabled;
		} );
		mutation.mutate( { mcp_abilities: { account: accountAbilities } } as any );
	};

	const groupToolsByCategory = (
		tools: Array< [ string, McpAbility ] >
	): Record< string, Array< [ string, McpAbility ] > > => {
		const grouped: Record< string, Array< [ string, McpAbility ] > > = {};
		tools.forEach( ( [ toolId, tool ] ) => {
			const displayCategory = getDisplayCategory( toolId, tool );
			if ( ! grouped[ displayCategory ] ) {
				grouped[ displayCategory ] = [];
			}
			grouped[ displayCategory ].push( [ toolId, tool ] );
		} );
		return grouped;
	};

	const siteSuggestions = sites.map( ( site ) => {
		return `${ site.ID }|${ getSiteDisplayName( site ) }`;
	} );

	const selectedSiteTokens = selectedSiteIds.map( ( siteId ) => {
		const site = sites.find( ( s ) => s.ID === siteId );
		if ( ! site ) {
			return String( siteId );
		}
		return `${ siteId }|${ getSiteDisplayName( site ) }`;
	} );

	const displaySiteName = ( tokenValue: string ) => {
		const parts = tokenValue.split( '|' );
		return parts.length > 1 ? parts[ 1 ] : tokenValue;
	};

	const handleSiteTokensChange = ( tokens: ( string | { value: string; title?: string } )[] ) => {
		const tokenStrings = tokens.map( ( token ) =>
			typeof token === 'string' ? token : token.value
		);
		const newSiteIds = tokenStrings
			.map( ( token ) => {
				const parts = token.split( '|' );
				const siteId = Number( parts[ 0 ] );
				return isNaN( siteId ) ? undefined : siteId;
			} )
			.filter( ( id ): id is number => id !== undefined );
		setSelectedSiteIds( newSiteIds );
	};

	const handleAllSitesToggle = ( enabled: boolean ) => {
		const sitesPayload = selectedSiteIds.map( ( siteId ) => ( {
			blog_id: siteId,
			account_tools_enabled: enabled,
		} ) );
		const payload = {
			mcp_abilities: {
				...( sitesPayload.length > 0 && { sites: sitesPayload } ),
			},
		};
		mutation.mutate( payload as any );
	};

	const handleSiteToggle = ( siteId: number, enabled: boolean ) => {
		mutation.mutate( {
			mcp_abilities: { sites: [ { blog_id: siteId, account_tools_enabled: enabled } ] },
		} as any );
	};

	const allSelectedSitesEnabled =
		selectedSiteIds.length > 0
			? selectedSiteIds.every( ( siteId ) =>
					getSiteAccountToolsEnabled( userSettings || {}, siteId )
			  )
			: false;

	// ─── Shared: tools section with categories ───────────────────────

	const renderToolsSection = ( tools: Array< [ string, McpAbility ] > ) => {
		if ( ! tools || tools.length === 0 ) {
			return null;
		}
		const groupedTools = groupToolsByCategory( tools );
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'What the AI can access' ) }
							description={ __(
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
											{ categoryTools.map( ( [ toolId, tool ]: [ string, McpAbility ] ) => (
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

	// ─── Variation A: Baseline (exact copy of original) ─────────────

	const renderVariationA = () => {
		return (
			<VStack spacing={ 8 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<HStack justify="space-between" alignment="top">
								<SectionHeader
									level={ 3 }
									title={ __( 'AI access' ) }
									description={ __(
										'Control what AI assistants can access your WordPress.com account and sites.'
									) }
								/>
								<VStack style={ { flexShrink: 0 } }>
									<RouterLinkButton
										to="/me/preferences/ai-and-mcp/setup"
										variant="secondary"
										disabled={ ! anyToolsEnabled }
									>
										{ __( 'Configure MCP Client' ) }
									</RouterLinkButton>
								</VStack>
							</HStack>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={
									<Text>
										{ anyToolsEnabled ? __( 'Disable AI access' ) : __( 'Enable AI access' ) }
									</Text>
								}
							/>
						</VStack>
					</CardBody>
				</Card>

				{ hasTools && anyToolsEnabled && (
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ __( 'Site-specific MCP settings' ) }
									description={ __(
										'Choose sites to manage AI access for all users on those sites. This overrides your account settings.'
									) }
								/>
								<FormTokenField
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Select sites to manage AI access' ) }
									value={ selectedSiteTokens }
									suggestions={ siteSuggestions }
									onChange={ handleSiteTokensChange }
									displayTransform={ displaySiteName }
									placeholder={ __( 'Type to search and select sites\u2026' ) }
									__experimentalShowHowTo={ false }
									__experimentalExpandOnFocus
								/>
								{ selectedSiteIds.length > 0 && (
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ allSelectedSitesEnabled }
										disabled={ mutation.isPending }
										onChange={ handleAllSitesToggle }
										label={
											<Text>
												{ allSelectedSitesEnabled
													? __( 'Disable AI access for selected sites' )
													: __( 'Enable AI access for selected sites' ) }
											</Text>
										}
									/>
								) }
								{ disabledSites.length > 0 && (
									<VStack spacing={ 4 }>
										<SectionHeader
											level={ 3 }
											title={ __( 'Sites with disabled MCP access' ) }
											description={ __(
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

	// ─── Variation B: Hub-and-spoke (summary cards → sub-pages) ─────
	// Matches the Security hub pattern: master toggle at top,
	// then RouterLinkSummaryButton cards that link to dedicated sub-pages.

	const renderVariationB = () => {
		const toolsBadges: SummaryButtonBadgeProps[] = [
			{
				text:
					enabledToolsCount === availableTools.length
						? __( 'All enabled' )
						: sprintf(
								/* translators: %1$d is number of enabled tools, %2$d is total tools */
								__( '%1$d of %2$d enabled' ),
								enabledToolsCount,
								availableTools.length
						  ),
				intent: enabledToolsCount === availableTools.length ? 'success' : 'default',
			},
		];

		return (
			<VStack spacing={ 6 }>
				{ /* Master toggle card */ }
				<Card>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'AI access' ) }
								description={ __(
									'Allow AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ __( 'Enable AI access' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ /* Summary cards — only shown when AI access is on */ }
				{ hasTools && anyToolsEnabled && (
					<>
						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/tools"
							title={ __( 'MCP access' ) }
							description={ __(
								'Control what your AI assistant can do on your account and sites.'
							) }
							decoration={ <Icon icon={ lock } /> }
							badges={ toolsBadges }
						/>

						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/setup"
							title={ __( 'Connect AI assistant' ) }
							description={ __( 'Get instructions for connecting your AI assistant.' ) }
							decoration={ <Icon icon={ connection } /> }
						/>
					</>
				) }
			</VStack>
		);
	};

	// ─── Variation C: Flat — permission-level links inline (no tools sub-page) ──

	const renderVariationC = () => {
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
		const writeTools = [
			...( permissionGroups.write || [] ),
			...( permissionGroups.manage || [] ),
		];

		const badgesFor = ( tools: Array< [ string, McpAbility ] > ): SummaryButtonBadgeProps[] => {
			const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
			return [
				{
					text:
						enabledCount === tools.length
							? __( 'All enabled' )
							: sprintf(
									/* translators: %1$d is enabled count, %2$d is total */
									__( '%1$d of %2$d enabled' ),
									enabledCount,
									tools.length
							  ),
					intent: enabledCount === tools.length ? 'success' : 'default',
				},
			];
		};

		const sitesBadgesC: SummaryButtonBadgeProps[] = [
			{
				text:
					disabledSiteIds.length === 0
						? __( 'No restrictions' )
						: sprintf(
								/* translators: %d is number of restricted sites */
								__( '%d restricted' ),
								disabledSiteIds.length
						  ),
				intent: disabledSiteIds.length === 0 ? 'default' : 'warning',
			},
		];

		return (
			<VStack spacing={ 6 }>
				{ /* Master toggle card */ }
				<Card>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'AI access' ) }
								description={ __(
									'Allow AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ __( 'Enable AI access' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ /* Permission-level links — Read and Write (merged with Manage) */ }
				{ hasTools && anyToolsEnabled && (
					<>
						<SummaryButtonList
							title={ __( 'MCP access' ) }
							description={ __(
								'Control what your AI assistant can do on your account and sites.'
							) }
							density="medium"
						>
							{ readTools.length > 0 && (
								<RouterLinkSummaryButton
									key="read"
									to="/me/preferences/ai-and-mcp/tools/read"
									title={ __( 'Read' ) }
									decoration={ <Icon icon={ seen } /> }
									badges={ badgesFor( readTools ) }
								/>
							) }
							{ writeTools.length > 0 && (
								<RouterLinkSummaryButton
									key="write"
									to="/me/preferences/ai-and-mcp/tools/write"
									title={ __( 'Write' ) }
									decoration={ <Icon icon={ pencil } /> }
									badges={ badgesFor( writeTools ) }
								/>
							) }
							<RouterLinkSummaryButton
								to="/me/preferences/ai-and-mcp/sites"
								title={ __( 'Site restrictions' ) }
								description={ __( 'Restrict AI access for specific sites.' ) }
								decoration={ <Icon icon={ unseen } /> }
								badges={ sitesBadgesC }
							/>
						</SummaryButtonList>

						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/setup"
							title={ __( 'Connect AI assistant' ) }
							description={ __( 'Get instructions for connecting your AI assistant.' ) }
							decoration={ <Icon icon={ connection } /> }
						/>
					</>
				) }
			</VStack>
		);
	};

	// ─── Variation D: ActionList — settings-page danger-zone pattern ──

	const renderVariationD = () => {
		// Group tools by permission level
		const permissionGroups: Record< string, Array< [ string, McpAbility ] > > = {};
		availableTools.forEach( ( [ toolId, tool ] ) => {
			const level = getPermissionLevel( tool );
			if ( ! permissionGroups[ level ] ) {
				permissionGroups[ level ] = [];
			}
			permissionGroups[ level ].push( [ toolId, tool ] );
		} );

		// Merge Write + Manage into a single "Write" bucket
		const readTools = permissionGroups.read || [];
		const writeTools = [
			...( permissionGroups.write || [] ),
			...( permissionGroups.manage || [] ),
		];

		return (
			<VStack spacing={ 6 }>
				{ /* Master toggle card */ }
				<Card>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'AI access' ) }
								description={ __(
									'Allow AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ __( 'Enable AI access' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ /* ActionList items — settings page pattern */ }
				{ hasTools && anyToolsEnabled && (
					<>
						<ActionList
							title={ __( 'MCP access' ) }
							description={ __(
								'Control what your AI assistant can do on your account and sites.'
							) }
						>
							{ readTools.length > 0 && (
								<ActionList.ActionItem
									key="read"
									title={ __( 'Read' ) }
									description={ __( 'View your sites, posts, and account info.' ) }
									actions={
										<RouterLinkButton
											variant="secondary"
											size="compact"
											to="/me/preferences/ai-and-mcp/tools/read"
										>
											{ __( 'Manage' ) }
										</RouterLinkButton>
									}
								/>
							) }
							{ writeTools.length > 0 && (
								<ActionList.ActionItem
									key="write"
									title={ __( 'Write' ) }
									description={ __( 'Create, edit, and delete content, plugins, and settings.' ) }
									actions={
										<RouterLinkButton
											variant="secondary"
											size="compact"
											to="/me/preferences/ai-and-mcp/tools/write"
										>
											{ __( 'Manage' ) }
										</RouterLinkButton>
									}
								/>
							) }
							<ActionList.ActionItem
								title={ __( 'Site restrictions' ) }
								description={ __( 'Restrict AI access for specific sites.' ) }
								actions={
									<RouterLinkButton
										variant="secondary"
										size="compact"
										to="/me/preferences/ai-and-mcp/sites"
									>
										{ __( 'Manage' ) }
									</RouterLinkButton>
								}
							/>
						</ActionList>

						<ActionList>
							<ActionList.ActionItem
								title={ __( 'Connect AI assistant' ) }
								description={ __( 'Get instructions for connecting your AI assistant.' ) }
								actions={
									<RouterLinkButton
										variant="secondary"
										size="compact"
										to="/me/preferences/ai-and-mcp/setup"
									>
										{ __( 'Setup' ) }
									</RouterLinkButton>
								}
							/>
						</ActionList>
					</>
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
			default:
				return renderVariationA();
		}
	};

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
					description={ createInterpolateElement(
						__(
							'Control how AI assistants interact with your WordPress.com account and sites. <learnMoreLink/>'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="mcp" />,
						}
					) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_view" />
			{ renderCurrentVariation() }
		</PageLayout>
	);
}

export default McpComponentExplore;

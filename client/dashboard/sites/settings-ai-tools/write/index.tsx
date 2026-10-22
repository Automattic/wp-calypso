import '../style.scss';

import {
	isAutomatticianQuery,
	siteAbilitiesQuery,
	userSettingsQuery,
	userSettingsMutation,
	siteBySlugQuery,
} from '@automattic/api-queries';
import languages from '@automattic/languages';
import { useFuzzySearch } from '@automattic/search';
import { useSuspenseQuery, useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ToggleControl,
	SearchControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment, useDeferredValue, useMemo, useState } from 'react';
import { groupToolsByGroup, groupToolsBySubCategory } from '../../../../me/mcp/groups';
import { useMcpTracksAudienceProps } from '../../../../me/mcp/tracks';
import {
	getAccountMcpAbilities,
	getGroupDescriptors,
	getSiteContextToolIds,
	getSiteMcpAbilities,
	getSiteRemoteGroups,
	getSiteLevelEnabled,
	isRemoteAbilityEnabled,
	isRemoteKeyEnabled,
	mergeSiteMcpAbilities,
} from '../../../../me/mcp/utils';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import AnchorCopyButton from '../../../components/anchor-copy-button';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { isWriteTool, sortTools } from '../../../me/mcp/categories';
import McpGroupCard from '../mcp-group-card';
import RemoteAbilitiesSection, { collectNamespaces } from '../remote-abilities-section';
import type { McpAbility, McpGroupDescriptor } from '@automattic/api-core';

import '../../../me/mcp/toolbar.scss';

const TOOL_CATEGORY = 'write' as const;

interface ToolGroup {
	group: McpGroupDescriptor | null;
	label: string;
	tools: Array< [ string, McpAbility ] >;
}

interface SubGroup {
	subCategory: string | null;
	tools: Array< [ string, McpAbility ] >;
}

export default function SiteAIToolsWrite() {
	const { recordTracksEvent } = useAnalytics();
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const { siteSlug } = useParams( { strict: false } ) as { siteSlug: string };
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const accountAbilities = getAccountMcpAbilities( userSettings || {} );
	const siteContextToolIds = getSiteContextToolIds( userSettings || {} );
	const siteAbilities = getSiteMcpAbilities( userSettings || {}, site.ID );
	const siteAccountAbilities = siteContextToolIds.size
		? Object.fromEntries(
				Object.entries( accountAbilities ).filter( ( [ id ] ) => siteContextToolIds.has( id ) )
			)
		: accountAbilities;
	const mergedAbilities = mergeSiteMcpAbilities( siteAccountAbilities, siteAbilities );

	// When there are no site-specific overrides, use site_level_enabled_default as the effective
	// enabled state for every tool. True when account MCP is on, false when it's disabled for sites.
	const hasSiteAbilityOverrides = Object.keys( siteAbilities ).length > 0;
	const defaultToolEnabled =
		( userSettings as any )?.mcp_abilities?.site_level_enabled_default ?? false;
	const mcpAbilities = hasSiteAbilityOverrides
		? mergedAbilities
		: Object.fromEntries(
				Object.entries( mergedAbilities ).map( ( [ id, tool ] ) => [
					id,
					{ ...tool, enabled: defaultToolEnabled },
				] )
			);

	const allTools = ( Object.entries( mcpAbilities ) as Array< [ string, McpAbility ] > )
		.filter( ( [ , tool ] ) => tool.visible !== false )
		.filter( ( [ toolId, tool ] ) => isWriteTool( toolId, tool ) );

	// Tool search: fuzzy-filters the wpcom tools on this page and is passed down
	// to the site-published section.
	const [ search, setSearch ] = useState( '' );
	const deferredSearch = useDeferredValue( search );
	const query = deferredSearch.trim();

	const groupDescriptors = getGroupDescriptors( userSettings || {} ) as McpGroupDescriptor[];
	const searchableTools = allTools.map( ( [ toolId, tool ] ) => ( { toolId, tool } ) );
	const filteredSearchable = useFuzzySearch( {
		data: searchableTools,
		keys: [ 'tool.title', 'tool.description' ],
		query,
	} );
	const filteredTools = filteredSearchable.map(
		( { toolId, tool } ) => [ toolId, tool ] as [ string, McpAbility ]
	);
	const groups = groupToolsByGroup( filteredTools, groupDescriptors ) as ToolGroup[];

	// Site-published abilities on this page, for the page-level toggle and its
	// state. Staff-gated like the server-side remote: path (AI-1328) and cached
	// with the section's own query.
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const localeSlug = useLocale();
	const wpLocale = languages.find( ( { langSlug } ) => langSlug === localeSlug )?.wpLocale;
	const savedRemoteGroups = useMemo(
		() => ( isAutomattician ? getSiteRemoteGroups( userSettings || {}, site.ID ) : {} ),
		[ isAutomattician, userSettings, site.ID ]
	);
	const { data: remoteAbilities } = useQuery( {
		...siteAbilitiesQuery( site.ID, wpLocale || undefined ),
		enabled: !! site.jetpack && !! isAutomattician,
	} );
	const remoteNamespaces: ReturnType< typeof collectNamespaces > = useMemo(
		() =>
			isAutomattician
				? collectNamespaces( remoteAbilities, savedRemoteGroups, TOOL_CATEGORY )
				: new Map(),
		[ isAutomattician, remoteAbilities, savedRemoteGroups ]
	);
	const remoteGroupKeys = [ ...remoteNamespaces.values() ].flatMap( ( group ) => group.keys );
	const remoteAbilityKeys = [ ...remoteNamespaces.values() ].flatMap(
		( group ) => group.abilityKeys
	);

	// Site-published abilities with no saved choice follow the user's MCP access:
	// on when MCP is on for this site and any tool of this category is enabled.
	const remoteDefaultEnabled =
		getSiteLevelEnabled( userSettings || {}, site.ID ) &&
		allTools.some( ( [ , tool ] ) => tool.enabled );

	const pageAllEnabled =
		allTools.length > 0 &&
		allTools.every( ( [ , tool ] ) => tool.enabled ) &&
		[ ...remoteGroupKeys, ...remoteAbilityKeys ].every( ( key ) =>
			isRemoteKeyEnabled( savedRemoteGroups, key, remoteDefaultEnabled )
		) &&
		[ ...remoteNamespaces.values() ].every( ( group ) =>
			group.abilities.every( ( ability ) =>
				isRemoteAbilityEnabled(
					savedRemoteGroups,
					ability.name,
					ability.meta?.annotations,
					remoteDefaultEnabled
				)
			)
		);

	const mutation = useMutation(
		withSnackbar( userSettingsMutation(), {
			success: __( 'MCP settings saved.' ),
			error: __( 'Failed to save MCP settings.' ),
		} )
	);

	// When there are no existing overrides, materialize the implicit default alongside the change
	// so subsequent edits have a full baseline to work from.
	const buildAbilities = ( overrides: Record< string, boolean > ): Record< string, boolean > => {
		if ( hasSiteAbilityOverrides ) {
			return overrides;
		}
		const defaults: Record< string, boolean > = {};
		allTools.forEach( ( [ id ] ) => {
			defaults[ id ] = defaultToolEnabled;
		} );
		return { ...defaults, ...overrides };
	};

	const handleToolChange = ( toolId: string, enabled: boolean ) => {
		mutation.mutate( {
			mcp_abilities: {
				sites: [
					{
						blog_id: site.ID,
						abilities: buildAbilities( { [ toolId ]: enabled } ),
					},
				],
			},
		} );
	};

	const handleGroupEnableAll = (
		groupTools: Array< [ string, McpAbility ] >,
		enabled: boolean
	) => {
		const overrides: Record< string, boolean > = {};
		groupTools.forEach( ( [ toolId ] ) => {
			overrides[ toolId ] = enabled;
		} );
		mutation.mutate( {
			mcp_abilities: {
				sites: [
					{
						blog_id: site.ID,
						abilities: buildAbilities( overrides ),
					},
				],
			},
		} );
	};

	const handlePageToggle = ( enabled: boolean ) => {
		const overrides: Record< string, boolean > = {};
		allTools.forEach( ( [ toolId ] ) => {
			overrides[ toolId ] = enabled;
		} );
		// Both directions write group keys and saved ability-level keys:
		// ability-level trues actively allow, so disabling must clear them too.
		const remoteKeys = [ ...remoteGroupKeys, ...remoteAbilityKeys ];
		mutation.mutate(
			{
				mcp_abilities: {
					sites: [
						{
							blog_id: site.ID,
							abilities: buildAbilities( overrides ),
							...( remoteKeys.length > 0 && {
								remote_groups: Object.fromEntries( remoteKeys.map( ( key ) => [ key, enabled ] ) ),
							} ),
						},
					],
				},
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_site_enable_all_toggled', {
						...tracksAudienceProps,
						category: TOOL_CATEGORY,
						enabled,
						site_id: site.ID,
					} );
				},
			}
		);
	};

	const renderToolToggles = ( tools: Array< [ string, McpAbility ] > ) =>
		tools.map( ( [ toolId, tool ] ) => (
			<div key={ toolId } id={ toolId }>
				<HStack justify="space-between" alignment="flex-start" spacing={ 2 }>
					<div style={ { flex: 1, minWidth: 0 } }>
						<ToggleControl
							__nextHasNoMarginBottom
							checked={ tool.enabled }
							disabled={ mutation.isPending }
							label={ tool.title }
							help={ tool.description }
							onChange={ ( checked ) => handleToolChange( toolId, checked ) }
						/>
					</div>
					<AnchorCopyButton anchor={ toolId } />
				</HStack>
			</div>
		) );

	const renderToolsContent = ( groupTools: Array< [ string, McpAbility ] > ) => (
		<VStack spacing={ 4 }>
			{ ( groupToolsBySubCategory( groupTools ) as SubGroup[] ).map(
				( { subCategory, tools: subTools }, subIndex ) => (
					<Fragment key={ subCategory ?? '__ungrouped__' }>
						{ subIndex > 0 && (
							<hr
								style={ {
									border: 'none',
									borderTop: '1px solid var(--color-border-subtle, #dcdcde)',
									margin: 0,
								} }
							/>
						) }
						<VStack spacing={ 4 }>{ renderToolToggles( sortTools( subTools ) ) }</VStack>
					</Fragment>
				)
			) }
		</VStack>
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Write' ) }
					description={ __( 'Create, update, and manage content on your sites.' ) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_site_ai_tools_write_view" />
			<div className="mcp-tools-page">
				<div className="mcp-tools-toolbar">
					{ allTools.length > 0 ? (
						<Card>
							<CardBody>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ pageAllEnabled }
									disabled={ mutation.isPending }
									label={ <Text weight="600">{ __( 'Enable all' ) }</Text> }
									onChange={ handlePageToggle }
								/>
							</CardBody>
						</Card>
					) : (
						<Card>
							<CardBody>
								<Text variant="muted">
									{ __( 'No write tools are available for your account.' ) }
								</Text>
							</CardBody>
						</Card>
					) }
					<SearchControl
						value={ search }
						placeholder={ __( 'Search tools' ) }
						onChange={ ( value: string ) => {
							setSearch( value );
						} }
						__nextHasNoMarginBottom
					/>
				</div>
				{ groups.map( ( { group: descriptor, label, tools: groupTools } ) => {
					const groupKey = descriptor?.name ?? '__other__';
					const allGroupEnabled = groupTools.every( ( [ , tool ] ) => tool.enabled );

					return (
						<McpGroupCard
							key={ groupKey }
							id={ groupKey }
							title={ label }
							description={ descriptor?.description }
							toolAnchors={ groupTools.map( ( [ toolId ] ) => toolId ) }
							allEnabled={ allGroupEnabled }
							disabled={ mutation.isPending }
							forceOpen={ query.length > 0 }
							onEnableAll={ ( checked ) => handleGroupEnableAll( groupTools, checked ) }
						>
							{ renderToolsContent( groupTools ) }
						</McpGroupCard>
					);
				} ) }
				<RemoteAbilitiesSection
					site={ site }
					category={ TOOL_CATEGORY }
					search={ query }
					defaultEnabled={ remoteDefaultEnabled }
				/>
			</div>
		</PageLayout>
	);
}

import '../style.scss';

import {
	siteAbilitiesQuery,
	userSettingsQuery,
	userSettingsMutation,
	siteBySlugQuery,
} from '@automattic/api-queries';
import languages from '@automattic/languages';
import { useSuspenseQuery, useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { groupToolsByGroup, groupToolsBySubCategory } from '../../../../me/mcp/groups';
import { useMcpTracksAudienceProps } from '../../../../me/mcp/tracks';
import {
	getAccountMcpAbilities,
	getGroupDescriptors,
	getRemoteAbilityKey,
	getSiteContextToolIds,
	getSiteMcpAbilities,
	getSiteRemoteGroups,
	isRemoteAbilityEnabled,
	mergeSiteMcpAbilities,
} from '../../../../me/mcp/utils';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { isWriteTool, sortTools } from '../../../me/mcp/categories';
import McpGroupCard from '../mcp-group-card';
import RemoteAbilitiesSection, { collectNamespaces } from '../remote-abilities-section';
import type { McpAbility, McpGroupDescriptor } from '@automattic/api-core';

const TOOL_CATEGORY = 'read' as const;

interface ToolGroup {
	group: McpGroupDescriptor | null;
	label: string;
	tools: Array< [ string, McpAbility ] >;
}

interface SubGroup {
	subCategory: string | null;
	tools: Array< [ string, McpAbility ] >;
}

export default function SiteAIToolsRead() {
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
		.filter( ( [ toolId, tool ] ) => ! isWriteTool( toolId, tool ) );

	const groupDescriptors = getGroupDescriptors( userSettings || {} ) as McpGroupDescriptor[];
	const groups = groupToolsByGroup( allTools, groupDescriptors ) as ToolGroup[];

	// Site-published abilities on this page, for the page-level toggle and its
	// state. Cached with the section's own query.
	const localeSlug = useLocale();
	const wpLocale = languages.find( ( { langSlug } ) => langSlug === localeSlug )?.wpLocale;
	const savedRemoteGroups = getSiteRemoteGroups( userSettings || {}, site.ID );
	const { data: remoteAbilities } = useQuery( {
		...siteAbilitiesQuery( site.ID, wpLocale || undefined ),
		enabled: !! site.jetpack,
	} );
	const remoteNamespaces = collectNamespaces( remoteAbilities, savedRemoteGroups, TOOL_CATEGORY );
	const remoteGroupKeys = [ ...remoteNamespaces.values() ].flatMap( ( group ) => group.keys );
	const remoteAbilityKeys = [ ...remoteNamespaces.values() ].flatMap( ( group ) =>
		group.abilities.map( ( ability ) =>
			getRemoteAbilityKey( ability.name, ability.meta?.annotations )
		)
	);

	const pageAllEnabled =
		allTools.length > 0 &&
		allTools.every( ( [ , tool ] ) => tool.enabled ) &&
		remoteGroupKeys.every( ( key ) => savedRemoteGroups[ key ] === true ) &&
		[ ...remoteNamespaces.values() ].every( ( group ) =>
			group.abilities.every( ( ability ) =>
				isRemoteAbilityEnabled( savedRemoteGroups, ability.name, ability.meta?.annotations )
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
		// Enabling writes every group and ability key; disabling clears the group
		// keys and leaves any ability-level entries dormant behind them.
		const remoteKeys = enabled ? [ ...remoteGroupKeys, ...remoteAbilityKeys ] : remoteGroupKeys;
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
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ tool.enabled }
					disabled={ mutation.isPending }
					label={ tool.title }
					help={ tool.description }
					onChange={ ( checked ) => handleToolChange( toolId, checked ) }
				/>
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
					title={ __( 'Read' ) }
					description={ __( 'View your sites content.' ) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_site_ai_tools_read_view" />
			<VStack spacing={ 4 }>
				{ allTools.length > 0 && (
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
				) }
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
							onEnableAll={ ( checked ) => handleGroupEnableAll( groupTools, checked ) }
						>
							{ renderToolsContent( groupTools ) }
						</McpGroupCard>
					);
				} ) }
				<RemoteAbilitiesSection site={ site } category={ TOOL_CATEGORY } />
			</VStack>
		</PageLayout>
	);
}

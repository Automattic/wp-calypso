import '../style.scss';

import { userSettingsQuery, userSettingsMutation, siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import {
	getAccountMcpAbilities,
	getSiteContextToolIds,
	getSiteMcpAbilities,
	mergeSiteMcpAbilities,
} from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { siteRoute } from '../../../app/router/sites';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import {
	CATEGORY_ORDER,
	SUB_CATEGORY_ORDER,
	getDisplayCategory,
	getSubCategory,
	isWriteTool,
	sortTools,
} from '../../../me/mcp/categories';

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	readonly?: boolean;
	visible?: boolean;
	annotations?: Record< string, unknown >;
}

export default function SiteAIToolsWrite() {
	const { siteSlug } = siteRoute.useParams();
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

	const allTools = ( Object.entries( mcpAbilities ) as Array< [ string, McpAbility ] > ).filter(
		( [ , tool ] ) => tool.visible !== false
	);
	const writeTools = allTools.filter( ( [ toolId, tool ] ) => isWriteTool( toolId, tool ) );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

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

	const handleEnableAll = ( categoryTools: Array< [ string, McpAbility ] >, enabled: boolean ) => {
		const overrides: Record< string, boolean > = {};
		categoryTools.forEach( ( [ toolId ] ) => {
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

	// Group tools by display category
	const grouped: Record< string, Array< [ string, McpAbility ] > > = {};
	writeTools.forEach( ( [ toolId, tool ] ) => {
		const category = getDisplayCategory( toolId, tool );
		if ( ! grouped[ category ] ) {
			grouped[ category ] = [];
		}
		grouped[ category ].push( [ toolId, tool ] );
	} );

	const hasWriteTools = writeTools.length > 0;

	const renderToolToggles = ( tools: Array< [ string, McpAbility ] > ) =>
		tools.map( ( [ toolId, tool ] ) => (
			<ToggleControl
				key={ toolId }
				__nextHasNoMarginBottom
				checked={ tool.enabled }
				disabled={ mutation.isPending }
				label={ tool.title }
				help={ tool.description }
				onChange={ ( checked ) => handleToolChange( toolId, checked ) }
			/>
		) );

	const renderSubGroupedTools = (
		categoryTools: Array< [ string, McpAbility ] >,
		categoryName: string
	) => {
		const subGrouped: Record< string, Array< [ string, McpAbility ] > > = {};
		categoryTools.forEach( ( [ toolId, tool ] ) => {
			const sub = getSubCategory( toolId, tool ) ?? '';
			if ( ! subGrouped[ sub ] ) {
				subGrouped[ sub ] = [];
			}
			subGrouped[ sub ].push( [ toolId, tool ] );
		} );

		const order = SUB_CATEGORY_ORDER[ categoryName ] ?? [];
		const subGroups = order.filter( ( sub ) => subGrouped[ sub ] && subGrouped[ sub ].length > 0 );
		// Tools with no sub-category are appended at the end so they are never silently dropped.
		const ungrouped = subGrouped[ '' ] ?? [];
		const allGroups = ungrouped.length > 0 ? [ ...subGroups, '' ] : subGroups;

		return allGroups.map( ( subName, index ) => (
			<Fragment key={ subName || '__ungrouped__' }>
				{ index > 0 && <CardDivider className="mcp-settings__tool-group-divider" /> }
				<CardBody>
					<VStack spacing={ 4 }>{ renderToolToggles( sortTools( subGrouped[ subName ] ) ) }</VStack>
				</CardBody>
			</Fragment>
		) );
	};

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
			<VStack spacing={ 4 }>
				{ ! hasWriteTools && (
					<Card>
						<CardBody>
							<Text variant="muted">
								{ __( 'No write tools are available for your account.' ) }
							</Text>
						</CardBody>
					</Card>
				) }
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const categoryTools = grouped[ categoryName ];
					if ( ! categoryTools || categoryTools.length === 0 ) {
						return null;
					}

					const allEnabled = categoryTools.every( ( [ , tool ] ) => tool.enabled );
					const subOrder = SUB_CATEGORY_ORDER[ categoryName ];

					return (
						<Card key={ categoryName }>
							<CardHeader>
								<HStack justify="space-between" alignment="center">
									<Text as="h3" weight={ 600 } size={ 14 }>
										{ categoryName }
									</Text>
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ allEnabled }
										disabled={ mutation.isPending }
										label={ __( 'Enable all' ) }
										onChange={ ( checked ) => handleEnableAll( categoryTools, checked ) }
									/>
								</HStack>
							</CardHeader>
							{ subOrder ? (
								renderSubGroupedTools( categoryTools, categoryName )
							) : (
								<CardBody>
									<VStack spacing={ 4 }>{ renderToolToggles( categoryTools ) }</VStack>
								</CardBody>
							) }
						</Card>
					);
				} ) }
			</VStack>
		</PageLayout>
	);
}

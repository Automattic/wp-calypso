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

export default function SiteAIToolsRead() {
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
	const mcpAbilities = mergeSiteMcpAbilities( siteAccountAbilities, siteAbilities );

	const allTools = ( Object.entries( mcpAbilities ) as Array< [ string, McpAbility ] > ).filter(
		( [ , tool ] ) => tool.visible !== false
	);
	const readTools = allTools.filter( ( [ toolId, tool ] ) => ! isWriteTool( toolId, tool ) );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const handleToolChange = ( toolId: string, enabled: boolean ) => {
		mutation.mutate( {
			mcp_abilities: {
				sites: [
					{
						blog_id: site.ID,
						abilities: {
							[ toolId ]: enabled,
						},
					},
				],
			},
		} );
	};

	const handleEnableAll = ( categoryTools: Array< [ string, McpAbility ] >, enabled: boolean ) => {
		const abilities: Record< string, boolean > = {};
		categoryTools.forEach( ( [ toolId ] ) => {
			abilities[ toolId ] = enabled;
		} );
		mutation.mutate( {
			mcp_abilities: {
				sites: [
					{
						blog_id: site.ID,
						abilities,
					},
				],
			},
		} );
	};

	// Group tools by display category
	const grouped: Record< string, Array< [ string, McpAbility ] > > = {};
	readTools.forEach( ( [ toolId, tool ] ) => {
		const category = getDisplayCategory( toolId, tool );
		if ( ! grouped[ category ] ) {
			grouped[ category ] = [];
		}
		grouped[ category ].push( [ toolId, tool ] );
	} );

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

		return subGroups.map( ( subName, index ) => (
			<Fragment key={ subName }>
				{ index > 0 && <CardDivider /> }
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
					title={ __( 'Read' ) }
					description={ __( 'View your sites, posts, and account info.' ) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_site_ai_tools_read_view" />
			<VStack spacing={ 4 }>
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
